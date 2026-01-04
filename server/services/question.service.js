import Question from '../models/QuestionSchema.js';
import { ApiError } from '../utils/response.js';

class QuestionService {
  async createQuestion(questionData) {
    try {
      const question = await Question.create(questionData);
      return question;
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(400, 'Question with this title already exists');
      }
      throw error;
    }
  }

  async getAllQuestions(options = {}) {
    const {
      page = 1,
      limit = 100,
      questionType,
      category,
      difficulty,
      format,
      search,
      tags,
      sortBy = 'questionNumber',
      sortOrder = 'asc',
    } = options;

    const query = { isActive: true };

    if (questionType) query.questionType = questionType;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (format) query.format = format;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    const [questions, total] = await Promise.all([
      Question.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Question.countDocuments(query),
    ]);

    return {
      questions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async getQuestionById(questionId) {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new ApiError(404, 'Question not found');
    }
    return question;
  }

  async getQuestionBySlug(slug) {
    const question = await Question.findOne({ slug, isActive: true });
    if (!question) {
      throw new ApiError(404, 'Question not found');
    }
    return question;
  }

  async updateQuestion(questionId, updateData) {
    const question = await Question.findByIdAndUpdate(questionId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    return question;
  }

  async deleteQuestion(questionId) {
    const question = await Question.findByIdAndUpdate(
      questionId,
      { isActive: false },
      { new: true }
    );

    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    return question;
  }

  async getQuestionsByCategory(category) {
    const questions = await Question.find({ category, isActive: true })
      .sort('questionNumber')
      .lean();
    return questions;
  }

  async getQuestionsByDifficulty(difficulty) {
    const questions = await Question.find({ difficulty, isActive: true })
      .sort('questionNumber')
      .lean();
    return questions;
  }

  async incrementSubmission(questionId, accepted = false) {
    const question = await Question.findById(questionId);
    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    question.totalSubmissions += 1;
    if (accepted) {
      question.totalAccepted += 1;
    }
    question.updateAcceptanceRate();
    await question.save();

    return question;
  }

  async bulkCreateQuestions(questions, createdBy) {
    const createdQuestions = [];

    for (const questionData of questions) {
      try {
        const question = await this.createQuestion({
          ...questionData,
          createdBy,
        });
        createdQuestions.push(question);
      } catch (error) {
        console.error(
          `Failed to create question: ${questionData.title}`,
          error
        );
        // Continue with other questions
      }
    }

    return createdQuestions;
  }

  async getQuestionsStats() {
    const [
      totalQuestions,
      byDifficulty,
      byCategory,
      topAcceptanceRate,
      mostSubmitted,
    ] = await Promise.all([
      Question.countDocuments({ isActive: true }),
      Question.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
      Question.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Question.find({ isActive: true })
        .sort({ acceptanceRate: -1 })
        .limit(5)
        .select('title questionNumber acceptanceRate difficulty')
        .lean(),
      Question.find({ isActive: true })
        .sort({ totalSubmissions: -1 })
        .limit(5)
        .select('title questionNumber totalSubmissions difficulty')
        .lean(),
    ]);

    // Format difficulty stats
    const difficultyStats = {
      easy: 0,
      medium: 0,
      hard: 0,
    };
    byDifficulty.forEach((d) => {
      if (d._id) difficultyStats[d._id] = d.count;
    });

    // Format category stats
    const categoryStats = byCategory.map((c) => ({
      category: c._id,
      count: c.count,
    }));

    return {
      total: totalQuestions,
      byDifficulty: difficultyStats,
      byCategory: categoryStats,
      topAcceptanceRate,
      mostSubmitted,
    };
  }
}

export default new QuestionService();

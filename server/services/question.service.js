import Question from '../models/Question.js';
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
    } = options;

    const query = { isActive: true };
    if (questionType) query.questionType = questionType;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (format) query.format = format;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [questions, total] = await Promise.all([
      Question.find(query)
        .sort('questionNumber')
        .skip(skip)
        .limit(limit)
        .lean(),
      Question.countDocuments(query),
    ]);

    return {
      questions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
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
    const question = await Question.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true, runValidators: true }
    );

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
}

export default new QuestionService();
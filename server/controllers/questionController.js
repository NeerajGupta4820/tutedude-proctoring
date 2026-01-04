import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, PaginatedResponse } from '../utils/response.js';
import questionService from '../services/question.service.js';

export const createQuestion = asyncHandler(async (req, res) => {
  const questionData = { ...req.body, createdBy: req.user.id };
  const question = await questionService.createQuestion(questionData);
  res
    .status(201)
    .json(new ApiResponse(201, question, 'Question created successfully'));
});

export const getAllQuestions = asyncHandler(async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50,
    questionType: req.query.questionType,
    category: req.query.category,
    difficulty: req.query.difficulty,
    format: req.query.format,
    search: req.query.search,
    tags: req.query.tags,
    sortBy: req.query.sortBy || 'questionNumber',
    sortOrder: req.query.sortOrder || 'asc',
  };

  const { questions, pagination } =
    await questionService.getAllQuestions(options);
  res.json(
    new PaginatedResponse(
      200,
      questions,
      pagination,
      'Questions fetched successfully'
    )
  );
});

export const getQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.getQuestionById(req.params.id);
  res.json(new ApiResponse(200, question, 'Question fetched successfully'));
});

export const getQuestionBySlug = asyncHandler(async (req, res) => {
  const question = await questionService.getQuestionBySlug(req.params.slug);
  res.json(new ApiResponse(200, question, 'Question fetched successfully'));
});

export const getQuestionsByCategory = asyncHandler(async (req, res) => {
  const questions = await questionService.getQuestionsByCategory(
    req.params.category
  );
  res.json(
    new ApiResponse(
      200,
      questions,
      `Questions in ${req.params.category} fetched`
    )
  );
});

export const getQuestionsByDifficulty = asyncHandler(async (req, res) => {
  const questions = await questionService.getQuestionsByDifficulty(
    req.params.difficulty
  );
  res.json(
    new ApiResponse(
      200,
      questions,
      `${req.params.difficulty} questions fetched`
    )
  );
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.updateQuestion(
    req.params.id,
    req.body
  );
  res.json(new ApiResponse(200, question, 'Question updated successfully'));
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.deleteQuestion(req.params.id);
  res.json(new ApiResponse(200, question, 'Question deleted successfully'));
});

export const bulkCreateQuestions = asyncHandler(async (req, res) => {
  const { questions } = req.body;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, 'Questions array is required');
  }

  const createdQuestions = await questionService.bulkCreateQuestions(
    questions,
    req.user.id
  );

  res.status(201).json(
    new ApiResponse(
      201,
      {
        created: createdQuestions.length,
        questions: createdQuestions,
      },
      `${createdQuestions.length} questions created successfully`
    )
  );
});

export const getQuestionsStats = asyncHandler(async (req, res) => {
  const stats = await questionService.getQuestionsStats();
  res.json(new ApiResponse(200, stats, 'Questions stats fetched successfully'));
});

export default {
  createQuestion,
  getAllQuestions,
  getQuestion,
  getQuestionBySlug,
  getQuestionsByCategory,
  getQuestionsByDifficulty,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  getQuestionsStats,
};

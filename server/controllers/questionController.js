import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse, PaginatedResponse } from '../utils/response.js';
import questionService from '../services/question.service.js';

export const createQuestion = asyncHandler(async (req, res) => {
  const questionData = { ...req.body, createdBy: req.user.id };
  const question = await questionService.createQuestion(questionData);
  res.status(201).json(new ApiResponse(201, question, 'Question created successfully'));
});

export const getAllQuestions = asyncHandler(async (req, res) => {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 50,
    questionType: req.query.questionType,
    category: req.query.category,
    difficulty: req.query.difficulty,
    format: req.query.format,
  };

  const { questions, pagination } = await questionService.getAllQuestions(options);
  res.json(new PaginatedResponse(200, questions, pagination, 'Questions fetched successfully'));
});

export const getQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.getQuestionById(req.params.id);
  res.json(new ApiResponse(200, question, 'Question fetched successfully'));
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.updateQuestion(req.params.id, req.body);
  res.json(new ApiResponse(200, question, 'Question updated successfully'));
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.deleteQuestion(req.params.id);
  res.json(new ApiResponse(200, question, 'Question deleted successfully'));
});

export default {
  createQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
};
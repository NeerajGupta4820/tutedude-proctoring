// config/sockethandler/aiHandler.js
import axios from 'axios';
import aiChatService from '../../services/aiChat.service.js';

const PYTHON_API_URL = 'http://localhost:8000/api/ai-chat-stream';

export const setupAIHandlers = (io, socket) => {
  socket.on('ai-ask-question', async (data) => {
    const { prompt, conversationHistory, conversationId } = data;
    const user = socket.userData;

    console.log(
      `🤖 AI Request from ${user?.name || socket.id}: ${prompt?.substring(0, 30)}...`
    );

    if (!prompt) return;

    socket.emit('ai-status', { status: 'thinking' });

    // ✅ Step 1: Save USER message to DB
    let savedConversationId = conversationId;
    try {
      if (savedConversationId) {
        await aiChatService.saveMessage(savedConversationId, {
          role: 'user',
          content: prompt,
        });
        console.log(
          `💾 User message saved to conversation: ${savedConversationId}`
        );
      }
    } catch (error) {
      console.error('❌ Failed to save user message:', error.message);
    }

    // ✅ Step 2: Stream AI response
    let fullResponse = '';
    const startTime = Date.now();

    try {
      const response = await axios({
        method: 'POST',
        url: PYTHON_API_URL,
        data: {
          prompt: prompt,
          conversationHistory: conversationHistory || [],
        },
        responseType: 'stream',
      });

      response.data.on('data', (chunk) => {
        const textChunk = chunk.toString();
        fullResponse += textChunk; // ✅ Accumulate full response

        socket.emit('ai-response-chunk', {
          chunk: textChunk,
          timestamp: Date.now(),
        });
      });

      response.data.on('end', async () => {
        const responseTime = Date.now() - startTime;

        // ✅ Step 3: Save AI response to DB
        try {
          if (savedConversationId && fullResponse.trim()) {
            await aiChatService.saveMessage(savedConversationId, {
              role: 'assistant',
              content: fullResponse,
              responseTime: responseTime,
            });
            console.log(
              `💾 AI response saved (${responseTime}ms) to conversation: ${savedConversationId}`
            );
          }
        } catch (error) {
          console.error('❌ Failed to save AI response:', error.message);
        }

        socket.emit('ai-status', { status: 'done' });
        console.log(`✅ AI Response completed for ${user?.name || socket.id}`);
      });

      response.data.on('error', async (error) => {
        console.error('❌ Stream error:', error.message);

        // Save error message to DB
        try {
          if (savedConversationId) {
            await aiChatService.saveMessage(savedConversationId, {
              role: 'assistant',
              content: 'Error: Failed to generate response.',
              isError: true,
            });
          }
        } catch (e) {
          console.error('❌ Failed to save error message:', e.message);
        }

        socket.emit('ai-error', {
          message: 'AI response stream failed.',
        });
        socket.emit('ai-status', { status: 'error' });
      });
    } catch (error) {
      console.error('❌ AI Service Error:', error.message);

      // Save error to DB
      try {
        if (savedConversationId) {
          await aiChatService.saveMessage(savedConversationId, {
            role: 'assistant',
            content: 'Error: AI Service is currently unavailable.',
            isError: true,
          });
        }
      } catch (e) {
        console.error('❌ Failed to save error:', e.message);
      }

      socket.emit('ai-error', {
        message: 'AI Service is currently unavailable. Please try again later.',
      });
      socket.emit('ai-status', { status: 'error' });
    }
  });
};

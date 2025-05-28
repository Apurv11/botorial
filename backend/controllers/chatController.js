const claudeService = require('../services/claudeService');

class ChatController {
  // Handle sending messages to Claude and getting responses
  async sendMessage(req, res) {
    try {
      const { message, sessionId } = req.body;
      
      if (!message || message.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      console.log(`Received message from session ${sessionId || 'anonymous'}: ${message}`);

      // Get response from Claude through Bedrock
      const response = await claudeService.getRummyAdvice(message);
      
      if (!response.success) {
        return res.status(500).json({
          success: false,
          error: 'Failed to get response from AI assistant',
          message: response.message
        });
      }

      // In a real application, you might want to store the conversation in a database
      // For now, we'll just return the response
      
      res.json({
        success: true,
        response: response.message,
        sessionId: sessionId || `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
        usage: response.usage
      });

    } catch (error) {
      console.error('Chat controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Sorry, I encountered an error processing your request. Please try again.'
      });
    }
  }

  // Get chat history for a session (placeholder for future implementation)
  async getChatHistory(req, res) {
    try {
      const { sessionId } = req.params;
      
      // Placeholder - in a real implementation, you would retrieve from database
      // For now, return empty history
      res.json({
        success: true,
        sessionId: sessionId,
        messages: [],
        message: 'Chat history feature coming soon. Conversations are currently not persisted.'
      });

    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve chat history'
      });
    }
  }

  // Health check for the chat service
  async healthCheck(req, res) {
    try {
      // Test Claude service connectivity
      const testResponse = await claudeService.sendMessage('Hello', 'You are a helpful assistant. Respond with "Service is healthy" only.');
      
      res.json({
        success: true,
        status: 'healthy',
        claudeService: testResponse.success,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Chat health check error:', error);
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message
      });
    }
  }
}

module.exports = new ChatController(); 
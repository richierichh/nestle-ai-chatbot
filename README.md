# Nestlé AI Chatbot

An AI-powered chatbot for Nestlé that provides comprehensive nutritional and product information through advanced content scraping and intelligent search technologies.

![Nestlé AI Chatbot](attached_assets/Screenshot%202025-05-16%20at%202.54.08%20AM.png)

## Features

- **AI-Powered Conversations**: Uses OpenAI's advanced GPT-4o model to provide intelligent, context-aware responses
- **Nutritional Information**: Detailed nutritional data for Nestlé products
- **GraphRAG Technology**: Knowledge graph-based retrieval for enhanced answer accuracy
- **Vector Search**: Semantic search capabilities for finding relevant information
- **Customizable Interface**: Change chatbot name, icon, and color theme
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- TypeScript
- React
- TailwindCSS
- Shadcn/ui components
- Wouter for routing
- React Query for data fetching

### Backend
- Node.js with Express
- OpenAI integration
- Vector database for content search
- Knowledge graph database

## Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/nestle-ai-chatbot.git
cd nestle-ai-chatbot
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and add your OpenAI API key
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server
```bash
npm run dev
```

## Usage

After starting the application:

1. The chatbot icon appears in the bottom-right corner of the screen
2. Click on the icon to open the chat interface
3. Type your question about Nestlé products, recipes, or nutritional information
4. The chatbot will provide relevant information with references
5. Access settings by clicking the gear icon in the chat window
6. Customize the chatbot's appearance in the settings panel

## Customization

The chatbot supports extensive customization:

- **Name**: Change the chatbot's display name
- **Icon**: Upload a custom icon or use the default Nestlé icon
- **Icon Color**: Choose from 7 different color options (red, blue, green, purple, gold, silver, black)
- **Theme**: Select from 8 different theme colors for the chat interface
- **Language**: Set preferred language for interactions

## Project Structure

- `/client` - React frontend application
  - `/src/components` - UI components including chatbot interface
  - `/src/pages` - Application pages
  - `/src/lib` - Utility functions and API client
- `/server` - Express backend
  - `/data` - Nutritional database and product information
  - `/services` - GraphRAG, vector search, and scraping services
- `/shared` - Shared types and schemas

## Future Enhancements

- Multi-language support
- Voice interaction capabilities
- Enhanced product recommendations
- Personalized user experiences
- Integration with Nestlé e-commerce platforms

## Environment Variables

This project requires the following environment variables:

- `OPENAI_API_KEY` - Your OpenAI API key for AI functionality

## Notes on Data Privacy

The chatbot does not store personal information. All conversations are processed in real-time and are not persistently stored beyond the current session.

## License

[Specify license information here]

## Acknowledgments

- OpenAI for providing the GPT-4o model
- Nestlé for the brand inspiration and nutritional database
# Polly - Polling App with QR Code Sharing

A modern, full-stack polling application built with Next.js, Supabase, and AI-assisted development. Create polls, share them via QR codes, and view real-time results with beautiful visualizations.

## 🚀 Features

- **User Authentication**: Secure signup/login with Supabase Auth
- **Poll Management**: Create, edit, delete, and manage polls
- **QR Code Sharing**: Generate QR codes for easy poll sharing
- **Real-time Voting**: Live vote tracking and results
- **Results Visualization**: Interactive charts and statistics
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Anonymous Voting**: Support for both authenticated and anonymous users
- **Duplicate Prevention**: IP-based and user-based vote tracking

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Database & Auth**: Supabase
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **QR Codes**: qrcode library
- **TypeScript**: Full type safety
- **Deployment**: Vercel

## 🏗️ AI-Assisted Development

This project was built using various AI tools throughout the development process:

### Planning & Design
- **AI Chat (Claude)**: Used for structuring data models, defining API routes, and outlining user flows
- **Database Schema Design**: AI-assisted design of PostgreSQL schema with proper relationships and constraints

### Code Generation & Development
- **Component Development**: AI-assisted creation of React components, forms, and UI elements
- **API Route Development**: AI-generated API endpoints for voting and poll management
- **Database Integration**: AI-assisted Supabase client setup and query optimization
- **TypeScript Types**: AI-generated type definitions for better type safety

### UI/UX Enhancement
- **shadcn/ui Integration**: AI-assisted setup and customization of UI components
- **Responsive Design**: AI-guided implementation of mobile-first responsive layouts
- **Chart Integration**: AI-assisted integration of Recharts for data visualization

### Testing & Quality Assurance
- **Error Handling**: AI-assisted implementation of error boundaries and user feedback
- **Performance Optimization**: AI-guided optimization of database queries and component rendering

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd polly-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy the SQL schema from `supabase/schema.sql` and run it in the Supabase SQL editor

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📊 Database Schema

The application uses the following main tables:

- **polls**: Stores poll information (title, description, options, user_id)
- **votes**: Stores individual votes with duplicate prevention
- **auth.users**: Supabase auth users (managed automatically)

Key features of the schema:
- Row Level Security (RLS) for data protection
- Unique constraints to prevent duplicate voting
- JSON storage for poll options
- Automatic timestamp management

## 🎯 Usage

### For Poll Creators

1. **Sign Up/Login**: Create an account or sign in
2. **Create Poll**: Add a title, description, and multiple options
3. **Share Poll**: Generate QR codes or copy direct links
4. **View Results**: Monitor real-time voting results with charts
5. **Manage Polls**: Edit, activate/deactivate, or delete polls

### For Voters

1. **Access Poll**: Scan QR code or visit direct link
2. **Cast Vote**: Select an option and submit
3. **View Results**: See current results (if enabled by poll creator)

## 🔧 Key Implementation Decisions

### Authentication Strategy
- **Choice**: Email/password with Supabase Auth
- **Rationale**: Simple MVP approach, can add OAuth later
- **Benefits**: Secure, scalable, built-in session management

### Vote Tracking
- **Choice**: IP-based for anonymous users, user ID for authenticated users
- **Rationale**: Balance between preventing duplicates and allowing anonymous participation
- **Implementation**: Unique constraints in database schema

### QR Code Generation
- **Choice**: Client-side generation with qrcode library
- **Rationale**: Reduces server load, faster generation, works offline
- **Benefits**: Better user experience, scalable

### Data Visualization
- **Choice**: Recharts for React-specific charts
- **Rationale**: React-native, TypeScript support, responsive
- **Features**: Bar charts, pie charts, real-time updates

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

Make sure to set these in your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📁 Project Structure

```
polly-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── polls/             # Poll-related pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components (shadcn/ui)
│   └── ...               # Custom components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client configuration
│   ├── database.ts       # Database operations
│   └── utils.ts          # Helper functions
├── supabase/             # Database schema
└── public/               # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built as part of the "AI for Developers" program
- Demonstrates practical AI-assisted development workflows
- Uses modern web development best practices
- Showcases full-stack TypeScript development

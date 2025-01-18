# 🚀 AWS CDK Full-Stack Application

A powerful and scalable full-stack project built with AWS CDK and TypeScript, demonstrating modern cloud infrastructure deployment with a React frontend and various AWS services.

## 🌟 Overview

This project is a comprehensive showcase of cloud-native architecture, integrating multiple AWS services using Infrastructure as Code (IaC) with AWS CDK. It demonstrates enterprise-level patterns for building scalable, secure, and maintainable applications in the cloud.

## 🏗️ Architecture

### 🎨 Frontend
- Modern React application with Tailwind CSS for sleek, responsive styling
- Secure user authentication flow using Amazon Cognito
- Protected routes and authenticated API calls for enhanced security
- Responsive design with modern UI components for optimal user experience
- Global content delivery through CloudFront CDN
- Professional domain setup with Route 53 and ACM certificates

### ⚙️ Backend Services

1. 🔐 **Authentication (Amazon Cognito)**
   - Seamless user sign-up and sign-in experience
   - Secure JWT token-based authentication
   - Role-based access control
   - Protected API endpoints with automatic token validation

2. 🌐 **API Layer (API Gateway)**
   - RESTful API endpoints with versioning
   - Robust Cognito authorizer integration
   - Cross-Origin Resource Sharing (CORS) configuration
   - Request throttling and API key management

3. ⚡ **Compute (AWS Lambda)**
   - Efficient order management functions
   - Real-time SMS notification handling
   - Automated EventBridge event processing
   - Flexible event rule toggle functionality
   - Pay-per-use pricing model

4. 📦 **Database (DynamoDB)**
   - Highly available NoSQL database for order storage
   - Auto-scaling capabilities
   - Optimized for high-performance reads and writes
   - Cost-effective pay-per-request billing model

5. 📫 **Message Queue (SQS)**
   - Reliable message delivery with multiple queues
   - Automatic retry mechanism
   - Dead letter queues for failed message handling
   - Configurable message retention and visibility

6. 📱 **Notifications (SNS)**
   - Real-time SMS notification delivery
   - Topic-based publish/subscribe system
   - Multi-protocol message delivery
   - Automated fan-out architecture

7. ⏰ **Scheduled Tasks (EventBridge)**
   - Precise scheduled Lambda function execution
   - Pattern-based event filtering
   - Dynamic rule state management
   - Serverless event orchestration

## 📋 Prerequisites

- 📌 Node.js (v20.x recommended)
- 🔧 AWS CLI with configured credentials
- 🐙 GitHub account for version control
- ☁️ AWS account with appropriate permissions

## 🚦 Getting Started

1. 📥 Clone the repository
2. 💻 Install project dependencies:
   ```bash
   npm install
   ```
3. 🎨 Set up the frontend:
   ```bash
   cd frontend/my-react-app
   npm install
   ```

## 🛠️ Useful Commands

- 🔨 `npm run build` - Compile TypeScript to JavaScript
- 👀 `npm run watch` - Watch mode for development
- 🧪 `npm run test` - Run Jest unit tests
- 🚀 `npx cdk deploy` - Deploy to AWS
- 🔍 `npx cdk diff` - Review infrastructure changes
- 📄 `npx cdk synth` - Generate CloudFormation template

## 💻 Development

### 🎨 Frontend Development

The frontend is built using React and is located in the `frontend/my-react-app` directory. The build process is automated through AWS CodePipeline:

1. 🏗️ **Build Process**
   - Runs on AWS CodeBuild using Linux Standard 7.0 image
   - Executes `npm ci` for clean dependency installation
   - Creates production build with `npm run build`
   - Outputs optimized static files to `build/` directory

2. 📤 **Deployment**
   - Automatically deploys to S3 bucket via pipeline
   - Files are served through CloudFront distribution
   - Updates are atomic and version-controlled

3. 🧑‍💻 **Local Development**
   ```bash
   cd frontend/my-react-app
   npm start
   ```
   This starts the development server on http://localhost:3000

4. 🔄 **CI/CD Pipeline**
   - Source code changes trigger automatic builds
   - Build artifacts are validated before deployment
   - Zero-downtime deployments to production
   - Rollback capability on deployment failures


## 🔄 CI/CD Pipeline

Our robust CI/CD pipeline powered by AWS CodePipeline ensures:
- 🔄 Automated deployments from GitHub
- 🏗️ Infrastructure as Code synthesis
- 🎨 Frontend build optimization
- 🚀 Zero-downtime deployments
- 📊 Deployment status monitoring

## 🔐 Environment Setup

- 🔑 `CDK_DEFAULT_ACCOUNT`: Your AWS account ID
- 🌍 `CDK_DEFAULT_REGION`: Target AWS region
- 🤫 Secrets (stored in AWS Secrets Manager):
  - `github_token2`: GitHub OAuth token

## 🛡️ Security Features

- 🔒 Enterprise-grade security with AWS Secrets Manager
- 🛡️ Best-practice AWS security patterns
- 🔐 Cognito-protected API endpoints
- 🌐 Private subnet database deployment
- 🔑 End-to-end HTTPS/TLS encryption

## 📁 Project Structure

The project follows a clean, modular architecture:
- 📂 `/lib` - CDK infrastructure modules
- 🎨 `/frontend` - React application
- ⚡ `/lambda` - Serverless functions
- 🧪 `/test` - Comprehensive test suite

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create your feature branch
3. 💾 Commit your changes
4. 🚀 Push to the branch
5. 📬 Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌟 Features Highlight

- 🔐 Secure user authentication
- 📦 Scalable order management
- 📱 Real-time notifications
- ⏰ Automated task scheduling
- 📊 Multi-database support
- 📫 Message queue processing
- ⚡ Real-time updates
- 🛡️ Protected API endpoints
- 🔄 Automated deployments

## 🎯 Performance

- 🌐 Global CDN distribution
- ⚡ Optimized asset delivery
- 📊 Auto-scaling capabilities
- 💾 Efficient data storage
- 🚀 Serverless architecture benefits

## 📞 Support

Need help? Have questions? Here's how to get support:
- 📝 Open an issue on GitHub
- 📧 Contact the development team
- 📚 Check our documentation

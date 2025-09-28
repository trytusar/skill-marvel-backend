# Skill Marvel Backend

Skill Marvel Backend is a Node.js REST API server for managing courses, masterclasses, inquiries, and purchases for the Skill Marvel platform.

## Features

- User authentication and authorization
- Course and masterclass management (CRUD)
- Inquiry and contact form handling
- Purchase and payment integration
- Admin and user roles

## Technologies Used

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Axios (for external API calls)
- Multer (for file uploads)
- dotenv (for environment variables)

## Getting Started

### Prerequisites

- Node.js (v14 or above)
- MongoDB

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/skill-marvel-backend.git
    cd skill-marvel-backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add your environment variables:
    ```
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ZOHO_API_KEY=your_zoho_api_key
    ZOHO_ACCOUNT_ID=your_zoho_account_id
    ```

4. Start the server:
    ```sh
    npm start
    ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Courses

- `GET /api/courses` - List all courses
- `POST /api/courses` - Add a new course (admin only)
- `GET /api/courses/:id` - Get course by ID
- `PATCH /api/courses/:id` - Update course (admin only)
- `DELETE /api/courses/:id` - Soft delete course (admin only)

### Masterclasses

- `GET /api/masterclasses` - List all masterclasses
- `POST /api/masterclasses` - Add a new masterclass (admin only)
- `GET /api/masterclasses/:id` - Get masterclass by ID
- `PATCH /api/masterclasses/:id` - Update masterclass (admin only)
- `DELETE /api/masterclasses/:id` - Soft delete masterclass (admin only)

### Inquiries

- `POST /api/inquiries` - Submit an inquiry
- `GET /api/inquiries` - List all inquiries (admin only)
- `GET /api/inquiries/:id` - Get inquiry by ID
- `PATCH /api/inquiries/:id/register` - Mark inquiry as registered (admin only)
- `DELETE /api/inquiries/:id` - Delete inquiry (admin only)

### Contact Us

- `POST /api/contact` - Submit a contact form
- `GET /api/contact` - List all contact inquiries (admin only)
- `GET /api/contact/:id` - Get contact inquiry by ID
- `PATCH /api/contact/:id/resolve` - Mark contact inquiry as resolved (admin only)
- `DELETE /api/contact/:id` - Delete contact inquiry (admin only)

### Purchases

- `POST /api/purchase/masterclass/:masterClassId` - Initiate masterclass purchase
- `POST /api/purchase/course/:courseId` - Initiate course purchase

## Folder Structure

```
skill-marvel-backend/
├── controllers/
├── models/
├── routes/
├── uploads/
├── app.js
├── package.json
└── README.md
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

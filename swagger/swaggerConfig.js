const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Management API",
      version: "1.0.0",
      description:
        "API for managing users with authentication and authorization",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // Xác định định dạng token là JWT
        },
      },
    },
    security: [
      {
        bearerAuth: [], // Áp dụng Bearer Token toàn cầu
      },
    ],
  },
  apis: ["./routes/*.js"], // Đường dẫn tới các file chứa tài liệu Swagger
};

module.exports = swaggerJsDoc(options);

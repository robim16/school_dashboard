import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'services', // Scaning services folder for JSDoc
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'EduStream AI API Docs',
        version: '1.0.0',
        description: 'Documentación técnica de los servicios de EduStream AI. Esta guía describe los "endpoints" conceptuales utilizados por la aplicación para interactuar con Supabase.',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Servidor Local',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          BearerAuth: [],
        },
      ],
    },
  });
  return spec;
};

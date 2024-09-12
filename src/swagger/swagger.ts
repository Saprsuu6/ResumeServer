import { Express } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';
import swaggerUi from 'swagger-ui-express';

const __dirname = path.resolve();
const theme = new SwaggerTheme();

async function loadJsonFile(path: string) {
  try {
    const rawData = await fs.readFile(`${__dirname}${path}`, {
      encoding: 'utf8'
    });
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return null; // Возвращаем null или выбрасываем ошибку
  }
}

const swaggerDocs = (app: Express, baseUrl: string) => {
  loadJsonFile('/src/swagger/swaggerDocument.json').then((json) => {
    const options = {
      customCss: `.swagger-ui .topbar { display: none } ${theme.getBuffer(SwaggerThemeNameEnum.DARK_MONOKAI)}`
    };

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(json, options));
  });
  console.log(`Docs available at ${baseUrl}/api-docs`);
};

export default swaggerDocs;

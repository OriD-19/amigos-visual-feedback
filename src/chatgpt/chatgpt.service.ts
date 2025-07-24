import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class ChatGptService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  async generarEtiqueta(comentario: string): Promise<string> {
    const prompt = `A continuación se presenta un comentario de un cliente sobre un producto en una tienda. Tu tarea es generar una etiqueta corta y precisa que describa el contenido del comentario. La etiqueta debe ser un resumen claro, en una o dos palabras, que refleje el tema principal del comentario, como una categoría, la categoria debería ser general, que aplique a varios productos, no solo a uno. Solo envía una el nombre de la etiqueta, nada más. No mandes nada más. Un ejemplo de respuesta válida es: Producto defectuoso.

Comentario: "${comentario}"

Etiqueta:`;

    const respuesta = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      store: false,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    return respuesta.choices[0]?.message?.content ?? 'Sin etiqueta';
  }

  async generarSemaforoEmociones(comentario: string): Promise<string> {
    const prompt = `A continuación se presenta un comentario de un cliente sobre un producto en una tienda. Tu tarea es categorizar el comentario en el semaforo de emociones, es decir, si es una buena reseña, seria Verde, neutral, Amarillo, mala Rojo. No mandes nada más. Un ejemplo de respuesta válida es: Verde.

Comentario: "${comentario}"

Etiqueta:`;

    const respuesta = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      store: false,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    return respuesta.choices[0]?.message?.content ?? 'Sin etiqueta';
  }
}

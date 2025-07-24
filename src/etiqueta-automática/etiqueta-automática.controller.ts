import { Controller } from '@nestjs/common';
import { EtiquetaAutomáticaService } from './etiqueta-automática.service';

@Controller('etiqueta-automática')
export class EtiquetaAutomáticaController {
  constructor(
    private readonly etiquetaAutomáticaService: EtiquetaAutomáticaService,
  ) {}
}

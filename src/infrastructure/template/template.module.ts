import { Global, Module } from '@nestjs/common';
import { TEMPLATE_ENGINE } from '@application/ports';
import { SimpleTemplateEngineService } from './simple-template-engine.service';

@Global()
@Module({
  providers: [
    SimpleTemplateEngineService,
    {
      provide: TEMPLATE_ENGINE,
      useExisting: SimpleTemplateEngineService,
    },
  ],
  exports: [TEMPLATE_ENGINE],
})
export class TemplateModule {}

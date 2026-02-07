import { Global, Module } from '@nestjs/common';
import { NOTE_PARSER } from '@application/ports';
import { MarkdownNoteParserService } from './markdown-note-parser.service';

@Global()
@Module({
  providers: [
    MarkdownNoteParserService,
    {
      provide: NOTE_PARSER,
      useExisting: MarkdownNoteParserService,
    },
  ],
  exports: [NOTE_PARSER],
})
export class ParserModule {}

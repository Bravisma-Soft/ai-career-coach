# Resume Parser Dependencies

## Required NPM Packages

Install the following packages to enable resume parsing functionality:

```bash
npm install pdf-parse mammoth
npm install --save-dev @types/pdf-parse
```

### Package Details

1. **pdf-parse** (v1.1.1+)
   - Pure JavaScript PDF parser
   - Extracts text from PDF files
   - Works with Node.js buffers
   - No external dependencies

2. **mammoth** (v1.7.0+)
   - Converts DOCX files to plain text
   - Handles complex Word documents
   - Maintains formatting structure
   - Provides warnings for unsupported features

3. **@types/pdf-parse** (dev dependency)
   - TypeScript type definitions for pdf-parse
   - Enables type safety

### Installation Command

```bash
npm install pdf-parse mammoth && npm install --save-dev @types/pdf-parse
```

### Verification

After installation, verify the packages:

```bash
npm list pdf-parse mammoth
```

### Alternative: Add to package.json

Add these lines to your `package.json`:

```json
{
  "dependencies": {
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.7.2"
  },
  "devDependencies": {
    "@types/pdf-parse": "^1.1.4"
  }
}
```

Then run:

```bash
npm install
```

## Usage

Once installed, the resume parser will automatically use these libraries to extract text from:
- PDF files (.pdf)
- Word documents (.docx, .doc)
- Plain text files (.txt)

## Testing

Test the document parser:

```typescript
import { DocumentParser } from '@/utils/document-parser';
import fs from 'fs';

const buffer = fs.readFileSync('path/to/resume.pdf');
const result = await DocumentParser.extractTextFromPDF(buffer);
console.log(result.text);
```

## Troubleshooting

If you encounter issues:

1. **Canvas dependency errors**
   - pdf-parse may require canvas for some PDFs
   - Usually optional for text extraction
   - Install if needed: `npm install canvas`

2. **Memory issues with large PDFs**
   - Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`
   - Set file size limits in multer config

3. **DOCX parsing errors**
   - Ensure file is valid DOCX format
   - Check mammoth version compatibility
   - Review warnings in extraction result

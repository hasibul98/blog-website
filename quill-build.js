const Quill = require('quill');
const { Table, TableCell, TableRow, Clipboard } = require('quill-better-table');

// Ensure modules are not registered multiple times if this script is run often
if (!Quill.imports['modules/better-table']) {
  Quill.register({
    'modules/better-table': Table,
    'formats/table': Table,
    'formats/table-row': TableRow,
    'formats/table-cell': TableCell,
    'modules/clipboard': Clipboard,
  }, true);
}

// This custom Quill instance will be used by ReactQuill
module.exports = Quill;

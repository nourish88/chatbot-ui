import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material";

const DataTable = ({
  columns,
  rows,
  loading,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  actions,
  totalCount,
  size = "medium",
}) => (
  <TableContainer
    sx={{
      width: "100%",
      maxHeight: "55vh",
      overflowY: "auto",
      overflowX: "auto",
    }}
    component={Paper}
  >
    <Table size={size} stickyHeader>
      <TableHead>
        <TableRow>
          {columns.map((col) => (
            <TableCell key={col.field || col.headerName}>
              {col.headerName}
            </TableCell>
          ))}
          {actions && <TableCell align="right">İşlem</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + (actions ? 1 : 0)}
              align="center"
            >
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            </TableCell>
          </TableRow>
        ) : rows.length > 0 ? (
          rows.map((row) => (
            <TableRow key={row.id || row.key}>
              {columns.map((col) => (
                <TableCell key={col.field || col.headerName}>
                  {row[col.field]}
                </TableCell>
              ))}
              {actions && <TableCell align="right">{actions(row)}</TableCell>}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns.length + (actions ? 1 : 0)}
              align="center"
            >
              Veri yok
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
    <TablePagination
      component="div"
      count={totalCount || rows.length}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageOptions={[5, 10, 25, 50]}
      sx={{ width: "100%" }}
    />
  </TableContainer>
);

export default DataTable;

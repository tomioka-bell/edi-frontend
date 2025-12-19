import { Skeleton, Table as MuiTable, TableHead, TableRow, TableCell, TableBody, Box } from "@mui/material";

export function LoadingTableSkeleton({ columns = 8, rows = 8 }: { columns?: number; rows?: number }) {
  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
      <MuiTable stickyHeader>
        <TableHead>
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableCell key={`head-${i}`}>
                <Skeleton variant="text" />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={`row-${r}`}>
              {Array.from({ length: columns }).map((__, c) => (
                <TableCell key={`cell-${r}-${c}`}>
                  <Skeleton variant="rectangular" height={20} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </Box>
  );
}

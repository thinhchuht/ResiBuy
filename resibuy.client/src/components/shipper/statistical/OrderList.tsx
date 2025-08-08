// OrderList.tsx
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer } from "@mui/material";

interface Order {
  id: string;
  store: string;
  amount: number;
  deliveredAt: string;
}

interface Props {
  orders: Order[];
}

export default function OrderList({ orders }: Props) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Mã đơn</TableCell>
            <TableCell>Cửa hàng</TableCell>
            <TableCell>Tiền ship</TableCell>
            <TableCell>Ngày giao</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.store}</TableCell>
              <TableCell>{order.amount.toLocaleString()} đ</TableCell>
              <TableCell>{order.deliveredAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

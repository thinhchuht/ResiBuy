import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const Main = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  maxWidth: '100%',
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
  [theme.breakpoints.down('md')]: {
    maxWidth: '100%',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

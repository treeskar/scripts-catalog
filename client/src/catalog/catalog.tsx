import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import ScriptsList from './scriptsList';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    header: {
      margin: '20px 0',
    },
    paper: {
      padding: theme.spacing(3),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }),
);

export const Catalog: React.FC = () => {
  const classes = useStyles();

  return (
    <Container maxWidth="xl" className="main-container">
      <header className={classes.header}>
        <Typography variant="h4" gutterBottom>
          Scripts Catalog
        </Typography>
      </header>
      <ScriptsList/>
    </Container>
  );
}

export default Catalog;

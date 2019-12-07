import React from 'react';
import { NavLink } from 'react-router-dom';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import Avatar from '@material-ui/core/Avatar';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import CodeOutlinedIcon from '@material-ui/icons/CodeOutlined';
import red from '@material-ui/core/colors/red';
import { ScriptType, MetadataType } from '../common';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      textDecoration: 'none',
      color: theme.palette.text.primary
    },
    errorText: {
      color: red[600],
    }
  }),
);

function getScriptDescription(scriptObj: MetadataType) {
  if (scriptObj.error) {
    return scriptObj.error;
  }
  const functionsCount = scriptObj.functions.length;
  if (!functionsCount) {
    return 'No function in script';
  }
  return `${functionsCount} function${functionsCount > 1? 's' : ''} in script`;
}

export const ScriptItem = ({ path, metadata }: ScriptType) => {
  const classes = useStyles();

  return (
    <NavLink to={'/edit/'+path} className={classes.root}>
      <ListItem button>
        <ListItemAvatar>
          <Avatar><CodeOutlinedIcon /></Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={path}
          secondary={
            <Typography
              variant="body2"
              className={metadata.error ? classes.errorText: ''}
              color="textPrimary"
            >
              {getScriptDescription(metadata)}
            </Typography>
          }
        />
      </ListItem>
    </NavLink> 
  );
}

export default ScriptItem;

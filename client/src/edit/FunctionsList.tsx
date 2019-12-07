import React, { useState } from 'react';
import { useQuery, useMutation } from "@apollo/react-hooks";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import Tooltip from '@material-ui/core/Tooltip';
import ListItem from '@material-ui/core/ListItem';
import Fab from '@material-ui/core/Fab'
import Avatar from '@material-ui/core/Avatar';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import FunctionIcon from '../icons/FunctionIcon'
import grey from '@material-ui/core/colors/grey';
import Dialog from '@material-ui/core/Dialog';
import PlayIcon from '@material-ui/icons/PlayArrowOutlined';
import DialogContent from '@material-ui/core/DialogContent';
import red from '@material-ui/core/colors/red';
import { useParams } from 'react-router-dom';
import TextField from '@material-ui/core/TextField';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import { GET_SCRIPT, EXECUTE_SOURCE } from '../common/queries';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flex: 1,
      margin: 0,
      overflow: 'auto',
    },
    errorIcon: {
      display: 'block',
      width: '80px',
      height: '80px',
      marginBottom: '20px',
      opacity: 0.3,
    },
    errorBlock: {
      flex: 1,
      margin: '20px 0 0',
      overflow: 'auto',
      justifyContent: 'top',
      flexDirection: 'column',
      alignItems: 'center',
      display: 'flex',
      color: red[600],
    },
    funcForm: {},
    terminal: {
      borderTop: `2px solid ${grey[200]}`,
      minHeight: '80px',
      backgroundColor: '#000',
      padding: '10px 20px 0',
      color: grey[200],
    },
    response: {
      fontSize: '14px',
      margin: 0,
      lineHeight: 1.5,
      color: grey[200],
    },
    runButton: {
      position: 'absolute',
      right: '10px',
      bottom: '100px',
      transform: 'translateY(50%)',
    },
    argumentInput: {
      margin: '0 10px',
    },
    argumentName: {
      fontSize: '20px',
    },
    argumentComa: {
      transform: 'translateY(8px)',
      fontSize: '150%', 
      fontFamily: 'Arial',
    }
  }),
);
export interface FunctionsListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  component?: React.ElementType<React.HTMLAttributes<HTMLDivElement>>;
  functions: {name: string, docstring: string}[]
}

interface Ifunc {
  name: string,
  docstring: string,
  returns: string,
  parameters: {
    default: string,
    annotation: string,
    kind: string,
    name: string
  }[]
}

const not_selected_fun: Ifunc = {
  name: 'Uknown',
  returns: '',
  docstring: '',
  parameters: []
}

export const FunctionsList: React.FC = () => {
  const { name } = useParams()
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [functionObj, setFunction] = useState(not_selected_fun);
  const [response, setResponse] = useState('');
  const { data, loading, error } = useQuery(GET_SCRIPT, { variables: { path: name } });
  const [executeSource] = useMutation(EXECUTE_SOURCE, {
    onCompleted: (data: any) => {
      setResponse(data.execSource.data)
    }
  });

  if (loading || !(data && data.script && data.script.metadata)) {
    return <p>Loading...</p>
  }

  if (data.script.metadata.error) {
    return (
      <div className={classes.errorBlock}>
        <ErrorOutlineOutlinedIcon className={classes.errorIcon}/>
        <Typography variant="body2">{data.script.metadata.error}</Typography>
      </div>
    )
  }

  function openExecutionDialog(func: any) {
    setOpen(true)
    setFunction({...func, args: []})
  }

  function handleClose() {
    setOpen(false)
    setResponse('')
  }

  const items = Array.from(data.script.metadata.functions).map((func: any, i) => (
    <ListItem button key={i} onClick={() => openExecutionDialog(func)}>
      <ListItemAvatar>
        <Avatar><FunctionIcon/></Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={func.name}
        secondary={func.docstring}
      />
    </ListItem>
  ));

  function handleSubmit(event: any) {
    event.preventDefault();
    const elements = event.target.elements;
    const args = functionObj.parameters.map(parm => {
      let value = elements[parm.name].value;
      if (!value && parm.default) {
        value = parm.default;
      }
      if (parm.annotation === 'str') {
        value = `"${value}"`
      }
      return `${parm.name}=${value}`;
    })
    const functionCall = `${functionObj.name}(${args.join(',')})`;
    executeSource({
      variables: {
        path: data.script.path,
        functionCall,
      } 
    });
    return false;
  }

  return (
    <>
      <List className={classes.root} dense={false}>
        {items}
      </List>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="md"
      >
        <DialogContent>
            <form className={classes.funcForm} noValidate onSubmit={handleSubmit} autoComplete="off">
              {functionObj.parameters.length ?
                <>
                  <Typography variant="h6">{functionObj.name} (</Typography>
                  <List>
                    {functionObj.parameters.map((param, i) => (
                      <ListItem key={i} dense={true}>
                        <strong className={classes.argumentName}>{param.name} =</strong>
                        <TextField
                          name={param.name}
                          className={classes.argumentInput}
                          placeholder={param.default}
                        />
                        {functionObj.parameters.length - 1 > i?
                          <strong className={classes.argumentComa}>,</strong> :
                          null
                        }
                      </ListItem>
                    ))}
                  </List>
                  <Typography variant="h6">)</Typography>
                </> :
                <Typography variant="h6">{functionObj.name} ()</Typography>
              }
              { functionObj.docstring ? 
                <Typography variant="subtitle1" gutterBottom color="textSecondary" className="italic">
                  # {functionObj.docstring}
                </Typography> :
                null
              }
              <Tooltip title="Execution Function" placement="left">
                <Fab color="primary" aria-label="run" type="submit" className={classes.runButton}>
                  <PlayIcon />
                </Fab>
              </Tooltip>
            </form>
        </DialogContent>
        <div className={classes.terminal}>
            <pre className={classes.response}>{response}</pre>
        </div>
      </Dialog>
    </>
  )
}

export default FunctionsList

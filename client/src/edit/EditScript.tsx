import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useParams } from 'react-router-dom'
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import { ControlledEditor } from '@monaco-editor/react';
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import ReactJson from 'react-json-view'
import Terminal from 'terminal-in-react';
import SplitPane from 'react-split-pane';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import { GET_SCRIPTS, GET_SCRIPT, UPDATE_SCRIPT, EXECUTE_SOURCE } from '../common/queries';
import FunctionsList from './FunctionsList';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexGrow: 1,
      overflow: 'auto',
      paddingTop: '10px',
    },
    header: {
      padding: '15px 0 10px',
      display: 'flex',
      position: 'relative',
      boxShadow: '0 11px 10px rgba(0,0,0,.1)',
      zIndex: 2,
    },
    headerContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    metadata: {
      flex: 1,
      position: 'relative',
      overflow: 'auto',
    },
    code: {
      flex: 1,
    },
    metadataViewBtn: {
      position: 'sticky',
      alignSelf: 'flex-end',
      zIndex: 2,
      right: '5px',
      top: '5px',
    },
    pane: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'auto',
    }
  }),
);

export const EditScript: React.FC = (props) => {
  const { name } = useParams()
  const [viewRawMetadata, setMetadataView] = useState(false)
  const { data, loading, error } = useQuery(GET_SCRIPT, { variables: { path: name } });
  const classes = useStyles();
  const [updateScript] = useMutation(
    UPDATE_SCRIPT,
    {
      refetchQueries: [
        { query: GET_SCRIPT, variables: { path: name } },
        { query: GET_SCRIPTS },
      ]
    },
  );
  const [executeSource] = useMutation(EXECUTE_SOURCE);

  let editor: any = null;
  if (loading) {
    return <h1>Loading...</h1>
  }

  function toggleMetadataView() {
    setMetadataView(!viewRawMetadata)
  }

  function onChange(e: any, value: any) {
    updateScript({variables: {path: name, source: value } });
  }

  function commandPassThrough(cmd: any, print: (input: string) => void) {
    executeSource({
      variables: {
        path: name,
        functionCall: cmd.join(' '),
      } 
    }).then((res) => print(res.data.execSource.data));
  }

  function generateDescription() {
    if (!data || !data.script) {
      return {}
    }
    const desc = data.script.metadata.functions.reduce((acc: any, func: any) => {
      const args = func.parameters.reduce((acc: string[], param: any) => {
        let res = param.name;
        if (param.annotation) {
          res += `: ${param.annotation}`;
        }
        if (param.default) {
          res += ` = ${param.default}`;
        }
        return [...acc, res]
      }, []).join(', ');
      const returns = func.returns ? `-> ${func.returns}` : ''
      acc[func.name] = `${func.name}(${args})${returns}
${func.docstring}
      `
      return acc;
    }, {});
    console.log(desc)
    return desc;
  }

  if (data && data.script) {
    const source: string = data.script.source;
    editor = <ControlledEditor width="100%%" height="100%" language="python" value={source} onChange={onChange}/>
  }
  return (
    <>
      <header className={classes.header}>
        <Container maxWidth="xl" className={classes.headerContainer}>
          <Tooltip title="Script Catalog" placement="bottom">
            <Link to="/">
                <IconButton edge="start" aria-label="back">
                  <ArrowBackIosOutlinedIcon />
                </IconButton>
            </Link>
          </Tooltip>
          <Typography variant="h4" gutterBottom>
            {name}
          </Typography>
        </Container>
      </header>
      <SplitPane split="horizontal" defaultSize={50} primary="second">
        <SplitPane split="vertical">
          <div className={classes.pane}>
            {editor}
          </div>
          <div className={classes.pane}>
            <Button
              className={classes.metadataViewBtn}
              onClick={toggleMetadataView}
            >
              {viewRawMetadata ? 'view structure' : 'view raw'}
            </Button>
            { viewRawMetadata ?
              <ReactJson
                style={{ padding: '10px', marginTop: '-30px' }}
                src={data.script.metadata}
                theme="summerfruit:inverted"
                enableClipboard={false}
              /> :
              <FunctionsList/>
            }
          </div>
        </SplitPane>
        <div className={classes.pane}>
          <Terminal
            color={grey[200]}
            style={{ fontSize: "1em" }}
            hideTopBar={true}
            commands={{ 't': () => {} }}
            description={{'t': 'some t function'}}
            startState="maximised"
            allowTabs={false}
            commandPassThrough={commandPassThrough}
            msg={`Hi, you can run script's "${name}" functions from terminal`}
          />
        </div>
      </SplitPane>
    </>
  );
}

export default EditScript;

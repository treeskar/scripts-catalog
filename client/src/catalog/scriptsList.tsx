import React from 'react';
import { useQuery } from "@apollo/react-hooks";
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import { GET_SCRIPTS } from '../common/queries';
import ScriptItem from './scriptItem';
import { ScriptType } from '../common';


export const ScriptsList: React.FC = () => {
  const { data, loading, error } = useQuery(GET_SCRIPTS);
  if (loading) {
    return <Typography variant="h5">Loading...</Typography>
  }
  const items = data ?
    data.scripts.map((script: ScriptType, i: number)  => (
      <ScriptItem path={script.path} metadata={script.metadata} key={i}></ScriptItem>
    )) :
    []

  return (
    <List dense={false}>{items}</List>
  );
}

export default ScriptsList;

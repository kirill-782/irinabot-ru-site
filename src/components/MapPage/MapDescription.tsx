import { Container, Segment } from "semantic-ui-react";
import ReactMarkdown from 'react-markdown';

export interface MapDescriptionProps {
  desctiption: string
}

function MapDescription( {desctiption} : MapDescriptionProps) {
  return ( 
    <Segment style={{width: "100%"}}>
      <ReactMarkdown>{desctiption}</ReactMarkdown>
    </Segment>
   );
}

export default MapDescription;
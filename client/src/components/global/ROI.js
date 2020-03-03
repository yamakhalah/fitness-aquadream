import React from 'react' 
import { MobilePDFReader } from 'reactjs-pdf-reader'
import { Container } from '@material-ui/core'
import ROI from '../../utils/docs/ROI.pdf'

export default function ROIReader() {
  const [pageNumber, setPageNumber] = React.useState(0)
  const [numPages, setNumPages] = React.useState(0)

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  return(
    <Container component="main" maxWidth="xl">
      <div style={{overflow:'scroll',height:600}}>
        <MobilePDFReader url={ROI} isShowHeader={false} isShowFooter={false}/>
      </div>
    </Container>
  )
}
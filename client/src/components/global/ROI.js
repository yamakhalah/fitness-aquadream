import React from 'react'
import { Document } from 'react-pdf/dist/entry.webpack'
import { Container } from '@material-ui/core'
import ROI from '../../utils/docs/ROI.pdf'

export default function ROIReader() {
  const [pageNumber, setPageNumber] = React.useState(0)
  const [numPages, setNumPages] = React.useState(0)

  onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  return(
    <Container component="main" maxWidth="xl">
      <Document
          file={ROI}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={pageNumber} />
      </Document>
    </Container>
  )
}
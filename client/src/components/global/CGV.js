import React from 'react'
import { Document } from 'react-pdf/dist/entry.webpack'
import { Container } from '@material-ui/core'
import CGV from '../../utils/docs/CGV.pdf'

export default function CGVReader() {
  const [pageNumber, setPageNumber] = React.useState(0)
  const [numPages, setNumPages] = React.useState(0)

  onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
  }

  return(
    <Container component="main" maxWidth="xl">
      <Document
          file={CGV}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page pageNumber={pageNumber} />
      </Document>
    </Container>
  )
}
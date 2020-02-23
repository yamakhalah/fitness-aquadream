import { Typography } from '@material-ui/core'
import React from 'react'

export default function Copyright() {
  return (
    <div>
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
        Digital Production 
      {' '}
      {new Date().getFullYear()}
    </Typography>
    <Typography variant="caption" color="textSecondary" align="center">
      AquAPI@Beta v1.0.0
    </Typography>
    </div>
  );
}
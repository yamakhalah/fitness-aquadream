import React from 'react';
import { Link } from 'react-router-dom';
import PageNotFound from '../../style/img/404.jpg';
const NotFound = () => (
<div>
<img src={PageNotFound} style={{width: '75%', height: '90%', display: 'block', margin: 'auto', position: 'relative' }} />
<center><Link to="/">Retourner à l'accueil</Link></center>
</div>
);
export default NotFound;
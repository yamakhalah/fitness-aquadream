import React from 'react'
import Footer from 'rc-footer';
import 'rc-footer/assets/index.css'; // import 'rc-footer/asssets/index.less';


export default function AquaFooter() {
  return(
    <Footer
    /*
      columns={[
        {
          icon: (
            <img src="https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg" />
          ),
          title: '语雀',
          url: 'https://yuque.com',
          description: '知识创作与分享工具',
          openExternal: true,
        },
      ]}
      */
      bottom="Powered by Digital Production - @Beta v1.0.0"
    />  
  )
}
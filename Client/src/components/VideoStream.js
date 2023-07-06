import React from 'react'

const VideoStream = () => {
  return (
    <div className="col" style={{paddingTop: '30px', width: '300px', margin: 'auto'}}>
      <div className="card-panel" style={{height: '586px'}}>
        <h5 style={{marginTop: '0px', marginBottom: '20px'}}>Participants</h5>
        <div id="peerVideoGrid" style={{maxHeight: '90%', overflowY: 'auto'}}></div>
      </div>      
    </div>
  )
}

export default VideoStream;
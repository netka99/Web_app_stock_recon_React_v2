import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const ErrorNotification = ({ message, onClose }) => {
  return (
    <ErrorMessage>
      <div className="error-notification">
        <p>{message}</p>
        <button onClick={onClose}>X</button>
      </div>
    </ErrorMessage>
  )
}

ErrorNotification.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
}

const ErrorMessage = styled.div`
  .error-notification {
    background-color: #f8d7da; /* Light red for error state */
    border: 1px solid #e74c3c; /* Red border */
    padding: 1rem;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    opacity: 1; /* Initial opacity for visible state */
    transition: opacity 0.3s ease-in-out; /* Transition for fade-out */
  }

  .error-notification.hidden {
    opacity: 0; /* Opacity for hidden state (after timeout) */
  }

  .error-notification p {
    margin: 0;
    font-weight: bold;
    color: #333;
  }

  .error-notification button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: #999;
  }

  .error-notification button:hover {
    color: #666;
  }
`

export default ErrorNotification

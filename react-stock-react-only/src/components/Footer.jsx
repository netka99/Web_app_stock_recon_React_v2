import * as React from 'react'
import styled from 'styled-components'

const Footer = () => {
  return (
    <Wrapper>
      <h5>
        &copy; {new Date().getFullYear()}
        <span> Smaczny Kąsek </span>
      </h5>
      <h5> All rights reserved</h5>
    </Wrapper>
  )
}

const Wrapper = styled.footer`
  height: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(45deg, #6a18a4, #4a1bb4);
  text-align: center;
  position: fixed;
  bottom: 0;
  width: 100%;
  span {
    color: white;
    font-style: italic;
    font-family: 'Great Vibes', cursive;
    padding: 0 0.3rem;
  }
  h5 {
    color: black;
    margin: 0.1rem;
    font-weight: 400;
    text-transform: none;
    line-height: 1.5;
  }
  @media (min-width: 776px) {
    flex-direction: row;
  }
`

export default Footer

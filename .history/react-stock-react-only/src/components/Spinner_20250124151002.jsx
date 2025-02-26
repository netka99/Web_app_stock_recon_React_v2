import * as React from 'react'
import styled from 'styled-components'
import { size } from '../styles/devices'

// source code: https://codepen.io/travis_john/pen/xMNLam

const Spinner = () => {
  return (
    <>
      <Container>
        <div className="loader-container">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </Container>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="gooey">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30vh;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;

  svg {
    display: none;
  }

  .loader-container {
    width: 50%;
    height: 50%;
    position: relative;
    filter: url(#gooey);

    @media screen and (max-width: ${size.tabletS}) {
      width: 80%;
    }
  }

  .loader-container > * {
    position: absolute;
    display: inline-block;
    left: 0;
    width: 3rem;
    height: 3rem;
    background: linear-gradient(
      to bottom right,
      #e51ead,
      #e086bf
    );
    top: 25%;
    border-radius: 50%;
    animation: loading 4s infinite;
    transform: scale(0.1);
    opacity: 0;

    &:nth-child(1) {
      animation-delay: 0.5s;
    }
    &:nth-child(2) {
      animation-delay: 1s;
    }
    &:nth-child(3) {
      animation-delay: 1.5s;
    }
    &:nth-child(4) {
      animation-delay: 2s;
    }
  }

  @keyframes loading {
    50% {
      transform: scale(1.25);
      left: 50%;
      opacity: 1;
    }
    100% {
      transform: scale(0.1);
      left: 100%;
      opacity: 0;
    }
  }
`

export default Spinner

import * as React from 'react'
import styled, { css } from 'styled-components'
import { homeLabels } from '../utils/constants'
import { Link, LinkProps } from 'react-router-dom'
import { NavbarMain } from '../components/index'

const HomePage = () => {
  return (
    <main>
      <NavbarMain />
      <Wrapper>
        <div className="labelsContainer">
          {homeLabels.map((label) => {
            return (
              <StyledLink
                to={label.url}
                key={label.id}
                className="label"
                {...label}
                {...label.colors}
              >
                <div className="labelIcon">
                  <img src={label.icon} alt={label.title} className="icon" />
                </div>
                <div className="labelTitle">{label.title}</div>
              </StyledLink>
            )
          })}
        </div>
      </Wrapper>
    </main>
  )
}

const Wrapper = styled.section`
  position: fixed;
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  .labelsContainer {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px; /* Adjust the gap between grid items as needed */
    padding: 20px;
    width: fit-content; /* Shrinks the container to fit its content */
    margin: 0 auto; /* Centers the grid */
  }

  .label:nth-child(5) {
    grid-column: 1 / 3; /* Span across both columns */
    justify-self: center; /* Center horizontally */
  }

  .label {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 0.3rem 0.8rem;
    cursor: pointer;
    font-weight: bold;
    transition: background ease 0.3s;
    background: #f7f7f7;
    border-radius: 15px;
    box-shadow: 2px 3px 4px 1px rgba(0, 0, 0, 0.3);
    padding-top: 1.5rem;
    width: fit-content; /* Shrinks the label */
    max-width: 100px; /* Optional: Set a max width if needed */
    transition: background ease 0.3s;

    @media screen and (max-width: 350px) {
      padding: 0.5rem;
    }
  }

  .icon {
    display: flex;
    justify-content: center;
    padding: 1rem;
    width: 2.5rem;
    height: 2.5rem;
    filter: invert(99%) sepia(5%) saturate(53%) hue-rotate(15deg) brightness(113%)
      contrast(95%);
  }
  .labelIcon {
    padding: 0.5rem;
    border-radius: 4rem;
    height: auto;
    width: auto;

    @media screen and (max-width: 768px) {
      padding: 0.1rem;
    }
  }

  .labelTitle {
    color: #656464;
    padding-top: 1rem;
    padding-bottom: 1rem;
    font-size: 1.1rem;

    @media screen and (max-width: 768px) {
      padding-bottom: 0.1rem;
      padding-top: 0.1rem;
      font-size: 0.9rem;
    }
  }
`

const StyledLink = styled(Link)`
  .labelIcon {
    ${({ backgroundprimary, backgroundsecondary, hoverprimary, hoversecondary }) => css`
      background: linear-gradient(45deg, ${backgroundprimary}, ${backgroundsecondary});
      transition: background 0.3s ease;

      &:hover {
        background: linear-gradient(45deg, ${hoverprimary}, ${hoversecondary});
      }
    `}
  }
`
export default HomePage

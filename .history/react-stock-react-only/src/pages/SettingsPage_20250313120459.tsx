import * as React from 'react'
import styled, { css } from 'styled-components'
import { Link, LinkProps } from 'react-router-dom'
import { settingsLabels } from '../utils/constants'
import { Navbar, Sidebar, Footer } from '../components/index'

const SettingsPage = () => {
  const pageTitle = 'Ustawienia'
  return (
    <main>
      <Navbar pageTitle={pageTitle} />
      <Sidebar />
      <ButtonSection>
        <div className="labelsContainer">
          {settingsLabels.map((label) => {
            return (
              <StyledLink to={label.url} key={label.id} className="label" {...label}>
                <div className="labelIcon">
                  <img src={label.icon} alt={label.title} className="icon" />
                </div>
                <div className="labelTitle">{label.title}</div>
              </StyledLink>
            )
          })}
        </div>
      </ButtonSection>
      <Footer />
    </main>
  )
}

const ButtonSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 65vh;
  padding-bottom: 5rem;

  .labelsContainer {
    display: flex;
    flex-direction: column;
  }

  .label {
    width: 28rem;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin: 2rem auto 1rem auto;
    padding: 1rem 1rem;
    flex-direction: row;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow:
      0 4px 8px 0 rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);
    cursor: pointer;

    @media screen and (max-width: 426px) {
      width: 80vw;
      padding: 0.5rem 0.5rem;
      margin: 1rem auto 1rem auto;
    }
  }

  .icon {
    display: flex;
    justify-content: center;
    padding: 0.5rem;
    width: 2.2rem;
    height: 2.2rem;
    filter: invert(99%) sepia(5%) saturate(53%) hue-rotate(15deg) brightness(113%)
      contrast(95%);
  }
  .labelIcon {
    padding: 0.5rem;
    border-radius: 4rem;
    height: auto;
    width: auto;
    margin: 0rem 2rem 0rem 2rem;
    @media screen and (max-width: 768px) {
      margin: 0rem 1rem 0rem 1rem;
    }
  }

  .labelTitle {
    font-size: 1.2rem;
    font-weight: bold;
    color: #656464;
  }
`

const StyledLink = styled(Link)`
  .labelIcon {
    ${({ bcgprimary, bcgsecondary, hoverprimary, hoversecondary }) => css`
      background: linear-gradient(45deg, ${bcgsecondary}, ${bcgprimary});
      transition: background 0.3s ease;

      &:hover {
        background: linear-gradient(45deg, ${hoversecondary}, ${hoverprimary});
      }
    `}
  }
`

export default SettingsPage

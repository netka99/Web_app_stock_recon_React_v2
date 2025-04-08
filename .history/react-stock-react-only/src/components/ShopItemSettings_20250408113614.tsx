import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import editImg from '../assets/edit.png'
import saveImg from '../assets/save-icon.png'
import trashImg from '../assets/delete.png'
import shopImg from '../assets/store-img.svg'
import { size } from '../styles/devices'

interface ShopItemProps {
  id: string
  name: string
  isEditing: boolean
  onToggleEdit: (id: string) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void
  onSave: (id: string) => void
  onDelete: (id: string) => void
}

const ShopItem: React.FC<ShopItemProps> = ({
  id,
  name,
  isEditing,
  onToggleEdit,
  onChange,
  onSave,
  onDelete,
}) => {
  return (
    <ShopContainer>
      <img className="store-picture" src={shopImg} alt="shop image" />
      <div className="store-name">
        {isEditing ? (
          <>
            <input value={name} onChange={(e) => onChange(e, id)} />
            <SaveButton onClick={() => onSave(id)} />
          </>
        ) : (
          <>
            <p>{name}</p>
            <EditButton onClick={() => onToggleEdit(id)} />
          </>
        )}
      </div>
      <DeleteButton onClick={() => onDelete(id)} />
    </ShopContainer>
  )
}

const EditButton = ({ onClick }) => (
  <Button className="edit-button" onClick={onClick}>
    <img src={editImg} className="item-picture" alt="edit" />
  </Button>
)

const SaveButton = ({ onClick }) => (
  <Button className="edit-button" onClick={onClick}>
    <img src={saveImg} className="item-picture" alt="save" />
  </Button>
)

const DeleteButton = ({ onClick }) => (
  <Button className="delete-button" onClick={onClick}>
    <img src={trashImg} className="item-picture" alt="delete" />
  </Button>
)

ShopItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onToggleEdit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}
EditButton.propTypes = {
  onClick: PropTypes.func.isRequired,
}
SaveButton.propTypes = {
  onClick: PropTypes.func.isRequired,
}
DeleteButton.propTypes = {
  onClick: PropTypes.func.isRequired,
}

const Button = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
`

const ShopContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  border-bottom: 2px solid #dfdfdf;

  .store-name {
    padding-left: 1rem;
    display: flex;
    align-items: center;
    width: 100%;
    p {
      padding-right: 2rem;
    }
  }

  .store-picture {
    width: 24px;
    margin: 8px;

    @media screen and (max-width: ${size.mobileL}) {
      padding-left: 0.3rem;
    }
    filter: invert(41%) sepia(0%) saturate(0%) hue-rotate(102deg) brightness(91%)
      contrast(85%);
  }
  .edit-button,
  .delete-button {
    margin-left: auto;
    background-color: transparent;
    border: none;
    cursor: pointer;

    @media screen and (max-width: $mobileL) {
      padding-right: 0rem;
    }
    img {
      display: block;
      /* width: 90%;
      height: 90%; */
    }
  }

  .edit-button {
    padding-left: 2rem;
    img {
      filter: brightness(0) saturate(100%) invert(65%) sepia(45%) saturate(5826%)
        hue-rotate(176deg) brightness(97%) contrast(92%);
    }
    &:focus,
    &:hover {
      filter: brightness(0) saturate(100%) invert(13%) sepia(92%) saturate(4907%)
        hue-rotate(228deg) brightness(88%) contrast(105%);
    }
  }

  .delete-button {
    padding-right: 2rem;

    @media screen and (max-width: ${size.mobileL}) {
      padding-right: 1rem;
    }
    img {
      filter: brightness(0) saturate(100%) invert(33%) sepia(87%) saturate(3694%)
        hue-rotate(335deg) brightness(99%) contrast(89%);
    }
    &:focus,
    &:hover {
      filter: brightness(0) saturate(100%) invert(30%) sepia(76%) saturate(2026%)
        hue-rotate(335deg) brightness(72%) contrast(96%);
    }
  }
`

export default ShopItem

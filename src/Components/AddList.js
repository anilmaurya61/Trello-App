import React, { useState } from 'react';
import { Button, TextField, Box, IconButton, CircularProgress } from '@mui/material';
import { AddOutlined as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';

const AddList = ({ isLoading, handleCreateLists, setListTitle, setShowCard }) => {
  const [showButton, setShowButton] = useState(true);

  const handleAddButton = () => {
    setShowButton(!showButton);
  };

  const handleListTitleChange = (e) => {
    setListTitle(e.target.value);
  };

  const handleAddList = () => {
    setShowCard(true);
  }

  return (
    <Box width='300px'>
      {showButton ? (
        isLoading ? <CircularProgress sx={{ margin: '10% 30%' }} /> :
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              handleAddButton();
            }}
            sx={{ width: '300px', justifyContent: 'flex-start', textAlign: 'left' }}
          >
            Add A List
          </Button>

      )
        :
        (

          <Box sx={{ backgroundColor: 'white', borderRadius: '10px', padding: '16px' }}>
            <TextField onChange={handleListTitleChange} label="List title" variant="outlined" sx={{ marginBottom: '10px', width: '100%' }} />
            <LoadingButton onClick={() => { handleAddList(); handleCreateLists(); }} variant="contained" sx={{ margin: '10px', width: '75%' }}>
              Add List
            </LoadingButton>
            <IconButton onClick={handleAddButton}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}
    </Box>
  );
};

export default AddList;
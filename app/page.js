'use client';
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { firestore } from '@/firebase';
import { Box, Button, Modal, Stack, TextField, Typography, MenuItem, Select, createTheme, ThemeProvider } from "@mui/material";
import { getDocs, query, collection, doc, getDoc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { OpenAI } from "openai";
import '../app/globals.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1c1c1c', // Dark grey for contrast
    },
    secondary: {
      main: '#4CA1AF', // Light blue for buttons
    },
    background: {
      default: '#ECEFF1', // Light grey for background
    },
    text: {
      primary: '#FFFFFF', // White text for contrast
    },
  },
  typography: {
    h2: {
      fontWeight: 700,
      color: '#FFFFFF',
    },
    h3: {
      fontWeight: 500,
      color: '#4CA1AF',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          color: '#FFFFFF', // White text for buttons
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          backgroundColor: '#FFFFFF', // White background for text fields
        },
      },
    },
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilterOption, setDateFilterOption] = useState('latest');
  const [quantityFilterOption, setQuantityFilterOption] = useState('all');

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      const data = doc.data();
      inventoryList.push({
        name: doc.id,
        ...data,
        timestamp: data.timestamp ? data.timestamp.toDate() : new Date(0)
      });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, timestamp: new Date() });
    } else {
      await setDoc(docRef, { quantity: 1, timestamp: new Date() });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1, timestamp: docSnap.data().timestamp });
      }
    }
    await updateInventory();
  };

  const removeAllItems = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const batch = writeBatch(firestore); // Use writeBatch to create a batch instance
    
    docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
  
    await batch.commit();
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    filterInventory(searchValue, dateFilterOption, quantityFilterOption);
  };

  const handleDateFilterChange = (e) => {
    const filterValue = e.target.value;
    setDateFilterOption(filterValue);
    filterInventory(searchTerm, filterValue, quantityFilterOption);
  };

  const handleQuantityFilterChange = (e) => {
    const filterValue = e.target.value;
    setQuantityFilterOption(filterValue);
    filterInventory(searchTerm, dateFilterOption, filterValue);
  };

  const filterInventory = (searchValue, dateFilterValue, quantityFilterValue) => {
    let filteredList = inventory.filter(item =>
      item.name.toLowerCase().includes(searchValue)
    );

    switch (dateFilterValue) {
      case 'latest':
        filteredList = filteredList.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'oldest':
        filteredList = filteredList.sort((a, b) => a.timestamp - b.timestamp);
        break;
      default:
        break;
    }

    switch (quantityFilterValue) {
      case 'most':
        filteredList = filteredList.sort((a, b) => b.quantity - a.quantity);
        break;
      case 'least':
        filteredList = filteredList.sort((a, b) => a.quantity - b.quantity);
        break;
      default:
        break;
    }

    setFilteredInventory(filteredList);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={2}
        sx={{
          color: 'white',
        }}
      >
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="background.paper"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)",
              borderRadius: '8px',
            }}
          >
            <Typography variant="h6">Add Item</Typography>
            <Stack direction="row" width="100%" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                sx={{
                  input: {
                    color: 'black', // Set text color to black
                  },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Button
          variant="contained"
          onClick={handleOpen}
        >
          Add New Item
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={removeAllItems}
          sx={{ marginBottom: 2 }}
        >
          Remove All Items
        </Button>
        <TextField
          variant="outlined"
          placeholder="Search items"
          value={searchTerm}
          onChange={handleSearch}
          sx={{
            marginBottom: 2,
            input: {
              textAlign: 'center', // Center the input text
              color: 'black', // Set text color to black
            },
          }}
        />
        <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
          <Select
            value={dateFilterOption}
            onChange={handleDateFilterChange}
            displayEmpty
          >
            <MenuItem value="latest">Recently Added</MenuItem>
            <MenuItem value="oldest">Previously Added</MenuItem>
          </Select>
          <Select
            value={quantityFilterOption}
            onChange={handleQuantityFilterChange}
            displayEmpty
          >
            <MenuItem value="all">All Quantities</MenuItem>
            <MenuItem value="most">Highest Quantity</MenuItem>
            <MenuItem value="least">Lowest Quantity</MenuItem>
          </Select>
        </Stack>
        <Box border="1px solid #333" borderRadius="8px" overflow="hidden">
          <Box
            width="800px"
            height="100px"
            bgcolor="primary.main"
            alignItems="center"
            justifyContent="center"
            display="flex"
          >
            <Typography variant="h2">
              Inventory Items
            </Typography>
          </Box>
          <Stack width="800px" height="300px" spacing={2} overflow="auto" p={2}>
            {filteredInventory.map(({ name, quantity }) => (
              <Box
                key={name}
                width="100%"
                minHeight="150px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="secondary.main"
                padding={5}
                borderRadius="8px"
              >
                <Typography
                  variant="h3"
                  textAlign="center"
                  sx={{ color: 'white' }} // Set text color to white
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography
                  variant="h3"
                  textAlign="center"
                  sx={{ color: 'white' }} // Set text color to white
                >
                  {quantity}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => addItem(name)}
                >
                  Add
                </Button>
                <Button
                  variant="contained"
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
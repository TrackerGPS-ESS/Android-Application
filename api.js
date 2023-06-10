import axios from 'axios';

export const fetchData = async () => {
  try {
    const response = await axios.get('https://6480c9ccf061e6ec4d49df73.mockapi.io/position');
    console.log(response.data)
    return response.data; // Assuming the response has a 'value' field
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
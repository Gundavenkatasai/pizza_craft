import google from 'googlethis';

async function test() {
  const options = {
    page: 0, 
    safe: false, // Safe Search
    additional_params: { 
      hl: 'en' 
    }
  };
  
  const response = await google.image('Margherita Pizza', options);
  console.log(response[0].url);
}

test();

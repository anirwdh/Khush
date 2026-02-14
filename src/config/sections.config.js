// Dynamic sections configuration for HomeScreen
export const SECTIONS_CONFIG = {
  newArrivals: {
    id: 'newArrivals',
    title: 'NEW ARRIVALS',
    type: 'tabbed-grid',
    tabs: ['Men', 'Women', 'Couple', 'Unisex'],
    data: {
      Men: [
        { id: '1', image: require('../assets/Images/image.png'), title: '21WN reversible angora cardigan', price: '$299', rating: 4.5 },
        { id: '2', image: require('../assets/Images/Image2.png'), title: 'Casual Wear', price: '$199', rating: 3.8 },
        { id: '3', image: require('../assets/Images/Image3.png'), title: 'Formal Suit', price: '$499', rating: 4.2 },
        { id: '4', image: require('../assets/Images/image.png'), title: 'Summer Collection', price: '$149', rating: 4.7 },
      ],
      Women: [
        { id: '5', image: require('../assets/Images/Image2.png'), title: 'Floral Dress', price: '$259', rating: 4.3 },
        { id: '6', image: require('../assets/Images/Image3.png'), title: 'Evening Gown', price: '$399', rating: 4.6 },
        { id: '7', image: require('../assets/Images/image.png'), title: 'Handbag', price: '$179', rating: 3.9 },
        { id: '8', image: require('../assets/Images/Image2.png'), title: 'Heels', price: '$129', rating: 4.1 },
      ],
      Couple: [
        { id: '9', image: require('../assets/Images/Image3.png'), title: 'Matching Set', price: '$599', rating: 4.4 },
        { id: '10', image: require('../assets/Images/image.png'), title: 'Couple Watch', price: '$449', rating: 4.8 },
        { id: '11', image: require('../assets/Images/Image2.png'), title: 'Twin Outfits', price: '$799', rating: 4.0 },
        { id: '12', image: require('../assets/Images/Image3.png'), title: 'Accessories', price: '$199', rating: 3.7 },
      ],
      Unisex: [
        { id: '13', image: require('../assets/Images/image.png'), title: 'T-Shirt', price: '$89', rating: 4.2 },
        { id: '14', image: require('../assets/Images/Image2.png'), title: 'Jeans', price: '$149', rating: 4.5 },
        { id: '15', image: require('../assets/Images/Image3.png'), title: 'Sneakers', price: '$199', rating: 4.1 },
        { id: '16', image: require('../assets/Images/image.png'), title: 'Jacket', price: '$299', rating: 4.6 },
      ],
    },
    showExploreMore: true,
    exploreMoreRoute: 'ProductListScreen',
  },
  topTrends: {
    id: 'topTrends',
    title: 'TOP TRENDS',
    type: 'tabbed-grid',
    tabs: ['Casual', 'Formal', 'Party', 'Sport'],
    data: {
      Casual: [
        { id: '17', image: require('../assets/Images/Image3.png'), title: 'Denim Jacket', price: '$189', rating: 4.3 },
        { id: '18', image: require('../assets/Images/image.png'), title: 'Cotton T-Shirt', price: '$49', rating: 4.1 },
        { id: '19', image: require('../assets/Images/Image2.png'), title: 'Shorts', price: '$79', rating: 3.9 },
        { id: '20', image: require('../assets/Images/Image3.png'), title: 'Sneakers', price: '$129', rating: 4.5 },
      ],
      Formal: [
        { id: '21', image: require('../assets/Images/image.png'), title: 'Business Suit', price: '$599', rating: 4.7 },
        { id: '22', image: require('../assets/Images/Image2.png'), title: 'Dress Shirt', price: '$89', rating: 4.2 },
        { id: '23', image: require('../assets/Images/Image3.png'), title: 'Leather Shoes', price: '$199', rating: 4.6 },
        { id: '24', image: require('../assets/Images/image.png'), title: 'Tie', price: '$39', rating: 4.0 },
      ],
      Party: [
        { id: '25', image: require('../assets/Images/Image2.png'), title: 'Cocktail Dress', price: '$349', rating: 4.4 },
        { id: '26', image: require('../assets/Images/Image3.png'), title: 'Party Heels', price: '$159', rating: 4.3 },
        { id: '27', image: require('../assets/Images/image.png'), title: 'Clutch Bag', price: '$89', rating: 3.8 },
        { id: '28', image: require('../assets/Images/Image2.png'), title: 'Statement Jewelry', price: '$129', rating: 4.5 },
      ],
      Sport: [
        { id: '29', image: require('../assets/Images/Image3.png'), title: 'Sport Shoes', price: '$149', rating: 4.6 },
        { id: '30', image: require('../assets/Images/image.png'), title: 'Track Pants', price: '$69', rating: 4.1 },
        { id: '31', image: require('../assets/Images/Image2.png'), title: 'Sports Bra', price: '$39', rating: 4.2 },
        { id: '32', image: require('../assets/Images/Image3.png'), title: 'Gym Bag', price: '$79', rating: 4.0 },
      ],
    },
    showExploreMore: true,
    exploreMoreRoute: 'ProductListScreen',
  },
  bestSellers: {
    id: 'bestSellers',
    title: 'BEST SELLERS',
    type: 'horizontal-scroll',
    data: [
      { id: '33', image: require('../assets/Images/image.png'), title: 'Classic White Shirt', price: '$99', rating: 4.8 },
      { id: '34', image: require('../assets/Images/Image2.png'), title: 'Blue Denim', price: '$179', rating: 4.6 },
      { id: '35', image: require('../assets/Images/Image3.png'), title: 'Black Leather Jacket', price: '$399', rating: 4.9 },
      { id: '36', image: require('../assets/Images/image.png'), title: 'Sneakers Collection', price: '$199', rating: 4.7 },
      { id: '37', image: require('../assets/Images/Image2.png'), title: 'Summer Dress', price: '$149', rating: 4.5 },
    ],
    showExploreMore: true,
    exploreMoreRoute: 'ProductListScreen',
  },
};

// Default order of sections to display
export const DEFAULT_SECTIONS_ORDER = [
  'newArrivals',
  'topTrends',
  'bestSellers',
];

// Helper function to get section data
export const getSectionData = (sectionId) => {
  return SECTIONS_CONFIG[sectionId] || null;
};

// Helper function to get all sections in order
export const getAllSections = () => {
  return DEFAULT_SECTIONS_ORDER.map(id => getSectionData(id)).filter(Boolean);
};

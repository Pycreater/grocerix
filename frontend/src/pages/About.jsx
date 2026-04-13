import Navbar from "../components/Navbar";

const About = () => {
  return (
    <div>
      <Navbar />

      <div className="p-10 max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          About FreshMart Grocery
        </h1>

        <p className="text-gray-600 mb-4">
          FreshMart Grocery is your trusted neighborhood grocery store located in Hadapsar, Pune. 
          We are committed to delivering fresh, high-quality fruits, vegetables, and daily essentials 
          directly to your doorstep.
        </p>

        <p className="text-gray-600 mb-4">
          Our mission is to provide healthy and affordable groceries while ensuring convenience and 
          excellent customer service. We carefully source our products to maintain freshness and quality.
        </p>

        <p className="text-gray-600">
          Whether you need daily essentials or fresh produce, FreshMart is here to make your shopping 
          experience easy, fast, and reliable.
        </p>
      </div>
    </div>
  );
};

export default About;
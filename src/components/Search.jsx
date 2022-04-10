import React, { useEffect, useState } from "react";

import MasonryLayout from "./MasonryLayout";
import { client } from "../client";
import { feedQuery, searchQuery } from "../utils/data";
import Spinner from "./Spinner";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../firebase";

const Search = ({ searchTerm }) => {
  const [pins, setPins] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsub = "";
    if (searchTerm !== "") {
      setLoading(true);
      const query = searchQuery(searchTerm.toLowerCase());
      client.fetch(query).then((data) => {
        setPins(data);
        setLoading(false);
      });
    } else {
      try {
        setLoading(true);
        const q = query(collection(db, "pins"));
        unsub = onSnapshot(q, (snapshot) => {
          const newPins = snapshot.docs.map((doc) => ({
            _id: doc.id,
            ...doc.data(),
          }));
          setPins(newPins);
        });
        setLoading(false);
      } catch (error) {
        console.log(error.message);
      }
    }
    return () => unsub;
  }, [searchTerm]);

  return (
    <div>
      {loading && <Spinner message="Searching pins" />}
      {pins?.length !== 0 && <MasonryLayout pins={pins} />}
      {pins?.length === 0 && searchTerm !== "" && !loading && (
        <div className="mt-10 text-center text-xl ">No Pins Found!</div>
      )}
    </div>
  );
};

export default Search;

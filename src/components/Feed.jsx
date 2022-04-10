import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { client } from "../client";
import { db } from "../firebase";
import { feedQuery, searchQuery } from "../utils/data";
import MasonryLayout from "./MasonryLayout";
import Spinner from "./Spinner";

const Feed = () => {
  const [loading, setLoading] = useState(false);
  const [pins, setPins] = useState(null);
  const { categoryId } = useParams();
  useEffect(() => {
    let unsub = "";
    setLoading(true);
    if (categoryId) {
      const q = query(
        collection(db, "pins"),
        where("category", "==", categoryId)
      );
      unsub = onSnapshot(q, (snapshot) => {
        const newPins = snapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
        }));
        setPins(newPins);
      });

      setLoading(false);
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
      // client.fetch(feedQuery).then((data) => {
      //   setPins(data);
      //   setLoading(false);
      // });
    }
    return () => unsub;
  }, [categoryId]);

  if (loading)
    return <Spinner message="we are adding new ideas to your feed!" />;

  if (!pins?.length)
    return (
      <h2 className="flex flex-col justify-center items-center text-xl">
        No Pin Available
      </h2>
    );
  return <div>{pins && <MasonryLayout pins={pins} />}</div>;
};

export default Feed;

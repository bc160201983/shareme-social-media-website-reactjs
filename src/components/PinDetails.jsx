import React, { useEffect, useState } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { client, urlFor } from "../client";
import MasonryLayout from "./MasonryLayout";
import { pinDetailMorePinQuery, pinDetailQuery } from "../utils/data";
import Spinner from "./Spinner";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const PinDetail = ({ user }) => {
  const { pinId } = useParams();
  const [pins, setPins] = useState([]);
  const [pinDetail, setPinDetail] = useState();
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [allComments, setAllComments] = useState([]);

  // const fetchPinDetails = async () => {
  //   if (pinId) {
  //     const pinRef = doc(db, `pins/${pinId}`);
  //     const pinSnap = await getDoc(pinRef);
  //     if (pinSnap.exists()) {
  //       setPinDetail({ ...pinSnap.data(), id: pinSnap.id });
  //       //console.log({ ...pinSnap.data(), _id: pinSnap.id });
  //     }
  //   }
  // };

  const morePins = async () => {
    let newPins = [];
    if (pinDetail?.category) {
      const q = query(
        collection(db, "pins"),
        where("category", "==", pinDetail.category)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        if (doc.id !== pinId) {
          newPins.push({ ...doc.data(), _id: doc.id });
        }
      });
      setPins(newPins);
    }
  };
  useEffect(() => {
    morePins();
  }, [pinDetail?.category, pinId]);

  useEffect(() => {
    //fetchPinDetails();
    const unsub = onSnapshot(doc(db, `pins/${pinId}`), (doc) => {
      setPinDetail(doc.data());
    });
    return () => unsub;
  }, [pinId]);

  const addComment = async () => {
    if (comment) {
      setAddingComment(true);

      const data = {
        text: comment,
        postedBy: {
          id: user._id,
          name: user.username,
          image: user.image,
        },
      };
      try {
        const commentRef = doc(db, "pins", `${pinId}`);
        await updateDoc(commentRef, { comments: arrayUnion(data) });
      } catch (error) {
        console.log(error.message);
      }
      setComment("");
      setAddingComment(false);
    }
  };

  if (!pinDetail) {
    return <Spinner message="Showing pin" />;
  }

  return (
    <>
      {pinDetail && (
        <div
          className="flex xl:flex-row flex-col m-auto bg-white"
          style={{ maxWidth: "1500px", borderRadius: "32px" }}
        >
          <div className="flex justify-center items-center md:items-start flex-initial">
            <img
              className="rounded-t-3xl rounded-b-lg"
              src={pinDetail?.image}
              alt="user-post"
            />
          </div>
          <div className="w-full p-5 flex-1 xl:min-w-620">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <a
                  href={`${pinDetail.image}?dl=`}
                  download
                  className="bg-secondaryColor p-2 text-xl rounded-full flex items-center justify-center text-dark opacity-75 hover:opacity-100"
                >
                  <MdDownloadForOffline />
                </a>
              </div>
              <a href={pinDetail.destination} target="_blank" rel="noreferrer">
                {pinDetail.destination}
              </a>
            </div>
            <div>
              <h1 className="text-4xl font-bold break-words mt-3">
                {pinDetail.title}
              </h1>
              <p className="mt-3">{pinDetail.about}</p>
            </div>
            <Link
              to={`/user-profile/${pinDetail?.postedBy.id}`}
              className="flex gap-2 mt-5 items-center bg-white rounded-lg "
            >
              <img
                src={pinDetail?.postedBy.image}
                className="w-10 h-10 rounded-full"
                alt="user-profile"
              />
              <p className="font-bold">{pinDetail?.postedBy.userName}</p>
            </Link>
            <h2 className="mt-5 text-2xl">Comments</h2>
            <div className="max-h-370 overflow-y-auto">
              {pinDetail.comments?.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-2 mt-5 items-center bg-white rounded-lg"
                >
                  <img
                    src={item.postedBy?.image}
                    className="w-10 h-10 rounded-full cursor-pointer"
                    alt="user-profile"
                  />
                  <div className="flex flex-col">
                    <p className="font-bold">{item.postedBy?.name}</p>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap mt-6 gap-3">
              <Link to={`/user-profile/${user._id}`}>
                <img
                  src={user.image}
                  className="w-10 h-10 rounded-full cursor-pointer"
                  alt="user-profile"
                />
              </Link>
              <input
                className=" flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300"
                type="text"
                placeholder="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                type="button"
                className="bg-red-500 text-white rounded-full px-6 py-2 font-semibold text-base outline-none"
                onClick={addComment}
              >
                {addingComment ? "Doing..." : "Done"}
              </button>
            </div>
          </div>
        </div>
      )}
      {pins?.length > 0 && (
        <h2 className="text-center font-bold text-2xl mt-8 mb-4">
          More like this
        </h2>
      )}
      {pins ? (
        <MasonryLayout pins={pins} />
      ) : (
        <Spinner message="Loading more pins" />
      )}
    </>
  );
};

export default PinDetail;

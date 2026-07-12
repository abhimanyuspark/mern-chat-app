import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import useDeviceType from "../../hooks/useDeviceType";
import Desktop from "../../components/chat/desktop/Desktop";
import Mobile from "../../components/chat/mobile/Mobile";
import { selectConversationId } from "../../redux/features/chat/chatSlice";
import useSocket from "../../hooks/useSocket";

const Home = () => {
  const { isDesktop, isMobile, isTablet } = useDeviceType();
  const dispatch = useDispatch();
  const { conversationId } = useParams();
  const user = useSelector((state) => state.auth.user);

  useSocket(user);

  useEffect(() => {
    dispatch(selectConversationId(conversationId || null));
  }, [conversationId, dispatch]);

  return (
    <>
      {(isDesktop || isTablet) && <Desktop />}
      {isMobile && <Mobile />}
    </>
  );
};

export default Home;

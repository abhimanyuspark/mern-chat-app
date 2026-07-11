import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchConversations } from "../../redux/features/chat/chatThunk";
import useDeviceType from "../../hooks/useDeviceType";
import DesktopContacts from "./desktop/DesktopContacts";
import MobileContacts from "./mobile/MobileContacts";

const Contacts = () => {
  const dispatch = useDispatch();
  const { isDesktop, isTablet, isMobile } = useDeviceType();

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return (
    <>
      {isDesktop && <DesktopContacts />}
      {isTablet && <DesktopContacts />}
      {isMobile && <MobileContacts />}
    </>
  );
};

export default Contacts;

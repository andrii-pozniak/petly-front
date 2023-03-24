import React, { useEffect, useState } from 'react';

import NoticesItem from './NoticesItem';

import { useNavigate, useParams } from 'react-router-dom';
import { NoticesItemsBody, NoticesLoader } from './NoticesItems.styles';
import { toast } from 'react-toastify';
import {
  fetchNoticesData,
  fetchNoticesUser,
  fetchUserFavorite,
} from '../../../utils/api/getNotices';
import { useAuth } from '../../../hooks/useAuth';
import Loader from '../../loader/loader';
import { NoticesPreview } from '../Notices.styled';

const NoticesItems = () => {
  const navigate = useNavigate();
  const { type } = useParams();
  const { token } = useAuth();

  const [data, setData] = useState(null);
  const [favoriteData, setFavoriteData] = useState([]);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (token) {
      (async () => {
        try {
          setStatus('pending');

          const data = await fetchUserFavorite(token);
          setStatus('fulfilled');
          setFavoriteData(data);
        } catch {
          setStatus('rejected');
        }
      })();
    }
  }, [token]);

  useEffect(() => {
    if ((type === 'own' && !token) || (type === 'favorite' && !token)) {
      return navigate('/login');
    }

    if (type === 'sell' || type === 'lost-found' || type === 'for-free') {
      (async () => {
        try {
          setStatus('pending');

          const data = await fetchNoticesData(type);
          setStatus('fulfilled');
          setData(data);
        } catch {
          setStatus('rejected');
        }
      })();
    }

    if (type === 'own' || type === 'favorite') {
      (async () => {
        try {
          setStatus('pending');

          const data = await fetchNoticesUser(token, type);
          setStatus('fulfilled');
          setData(data);
        } catch {
          setStatus('rejected');
        }
      })();
    }
  }, [type, token, navigate]);

  useEffect(() => {
    if (status === 'rejected') {
      toast.error(
        'Failed to fetch data, please reload the page or try again later',
        {
          theme: 'colored',
        }
      );
    }
  }, [status]);

  return (
    <>
      <NoticesItemsBody>
        {status === 'fulfilled' &&
          data?.map(
            ({
              _id,
              title,
              name,
              birthDate,
              imageURL,
              location,
              breed,
              price,
              comments,
            }) => (
              <NoticesItem
                key={_id}
                id={_id}
                title={title}
                name={name}
                birthDate={birthDate}
                imageURL={imageURL}
                breed={breed}
                location={location}
                price={price}
                comments={comments}
                favoriteData={favoriteData}
                setFavoriteData={setFavoriteData}
              />
            )
          )}
      </NoticesItemsBody>
      {status === 'pending' && (
        <NoticesLoader>
          <Loader />
        </NoticesLoader>
      )}

      {data?.length === 0 && (
        <NoticesPreview>
          There are no pets in this section yet, add them soon!
        </NoticesPreview>
      )}
    </>
  );
};

export default NoticesItems;
import { useState, useEffect } from 'react';
import { Button, Image, TextInput, View, StyleSheet, FlatList, Alert, Text } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

const App = () => {
  const [nome, setNome] = useState('');
  const [resumoDaAula, setResumoDaAula] = useState('');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [presencas, setPresencas] = useState([]);

  
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão de Localização', 'Permissão de localização negada!');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  
  const handleAddPresenca = async () => {
    if (!nome || !resumoDaAula || !photo || !location) {
      Alert.alert('Campos Incompletos', 'Por favor, preencha todos os campos!');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.76:3000/api/presencas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome,
          resumoDaAula,
          location,
          photo,
        }),
      });

      if (response.ok) {
        setNome('');
        setResumoDaAula('');
        setPhoto(null);
        fetchPresencas();
      } else {
        Alert.alert('Erro', 'Erro ao enviar presença');
      }
    } catch (error) {
      console.error('Erro de conexão com a API:', error);
      Alert.alert('Erro de Conexão', 'Erro ao conectar-se com a API.');
    }
  };

  
  const fetchPresencas = async () => {
    try {
      const response = await fetch('http://192.168.1.76:3000/api/presencas');
      const data = await response.json();
      console.log('Dados da API:', data); 
      setPresencas(data);
    } catch (error) {
      console.error('Erro ao carregar presenças:', error);
    }
  };
  

  
  const handleCapturePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão de Câmera', 'Permissão para usar a câmera é necessária!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: false,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão de Galeria', 'Permissão para acessar a galeria é necessária!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nome do aluno"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Resumo da Aula"
        value={resumoDaAula}
        onChangeText={setResumoDaAula}
      />

      <Button title="Tirar Foto" onPress={handleCapturePhoto} />
      <Button title="Escolher Imagem da Galeria" onPress={handlePickImage} />

      {photo && <Image source={{ uri: photo }} style={styles.image} />}

      <Button title="Adicionar Presença" onPress={handleAddPresenca} />

      <FlatList
        data={presencas}
        keyExtractor={(item) => item.id ? item.id.toString() : item.nome.toString()}
        renderItem={({ item }) => (
         <View style={styles.presencaItem}>
            <Text style={styles.presencaText}>{item.nome}</Text>
            <Text>{item.resumoDaAula}</Text>
            {item.photo && <Image source={{ uri: item.photo }} style={styles.image} />}
         </View>
  )}
/>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  image: {
    width: 100,
    height: 100,
    marginVertical: 10,
  },
  presencaItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  presencaText: {
    fontWeight: 'bold',
  },
});

export default App;

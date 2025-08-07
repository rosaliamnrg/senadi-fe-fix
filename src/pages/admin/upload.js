import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import LayoutAdmin from "./layout";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import '@fontsource/inter'; // default
import '@fontsource/epilogue'; // untuk judul

export default function AdminUpload() {
  const [loading, setLoading] = useState(false);
  const [fileKnowledge, setFileKnowledge] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  const {
    isAuthenticated,
    isAdmin,
    loading: authLoading,
    fetchWithAuth,
  } = useAuth();

  // Notifikasi otomatis hilang
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const loadFile = async () => {
    if (!isAuthenticated || !isAdmin) return;
    try {
      setLoading(true);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/get_file`,
        { method: "GET" }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setFileKnowledge(data.files || []);
      } else {
        setError(data.error || "Gagal memuat daftar file");
      }
    } catch (err) {
      setError("Gagal memuat file");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin && !authLoading) {
      loadFile();
    }
  }, [isAuthenticated, isAdmin, authLoading]);

  const handleUploadButtonClick = () => fileInputRef.current.click();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError("Pilih file terlebih dahulu");
      return;
    }

    setUploadLoading(true);
    setError("");
    setSuccess("");

    for (const file of files) {
      const formData = new FormData();
      formData.append("files", file);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload_github`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        const data = await response.json();
        if (!response.ok || !data.success) {
          setError(`Gagal upload ${file.name}`);
        } else {
          setSuccess(`Berhasil upload ${file.name}`);
        }
      } catch (err) {
        setError(`Gagal upload ${file.name}`);
      }
    }

    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadLoading(false);
    await loadFile(); // refresh daftar
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDelete = async (filename) => {
    const confirmDelete = window.confirm(`Yakin ingin menghapus ${filename}?`);
    if (!confirmDelete) return;
    try {
      const token = localStorage.getItem("token");
      setLoading(true);
      const encodedFilename = encodeURIComponent(filename);
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/delete_github/${encodedFilename}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSuccess("Berhasil menghapus file knowledge!");
        await loadFile();
      } else {
        setError("Tidak berhasil menghapus file knowledge!");
      }
    } catch (e) {
      setError("Terjadi kesalahan saat menghapus file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LayoutAdmin>
        {success && (
          <Box sx={{ mt: 2, mx: 2 }}>
            <Typography
              sx={{
                backgroundColor: "#e6ffed",
                color: "#007d41",
                border: "1px solid #b2dfdb",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              ✅ {success}
            </Typography>
          </Box>
        )}
        {error && (
          <Box sx={{ mt: 2, mx: 2 }}>
            <Typography
              sx={{
                backgroundColor: "#ffebee",
                color: "#c62828",
                border: "1px solid #f44336",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              ❌ {error}
            </Typography>
          </Box>
        )}

        <Box sx={{ flexGrow: 1, p: 2 }}>
          <Grid container spacing={3}>
            {/* Daftar File */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Daftar File Knowledge
                {
                      console.log(fileKnowledge)
                }
              </Typography>

              <Card>
                <Box sx={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      border: "1px solid",
                      borderCollapse: "collapse",
                    }}
                  >
                    <thead style={{ textAlign: "center" }}>
                      <tr>
                        <th
                          style={{
                            border: "1px solid #D9D9D9",
                            textAlign: "center",
                          }}
                        >
                          No
                        </th>
                        <th
                          style={{
                            border: "1px solid #D9D9D9",
                            textAlign: "center",
                          }}
                        >
                          Nama File
                        </th>
                        <th
                          style={{
                            border: "1px solid #D9D9D9",
                            textAlign: "center",
                          }}
                        >
                          Waktu Dikirim
                        </th>
                        <th
                          style={{
                            border: "1px solid #D9D9D9",
                            textAlign: "center",
                          }}
                        >
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ textAlign: "center" }}>
                      {loading ? (
                        <tr>
                          <td colSpan={4}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <CircularProgress />
                            </Box>
                          </td>
                        </tr>
                      ) : fileKnowledge.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: "10px" }}>
                            Tidak ada file yang sudah dimasukkan
                          </td>
                        </tr>
                      ) : (
                        fileKnowledge.map((file, index) => (
                          <tr key={`${file.filename}-${index}`}>
                            <td
                              style={{
                                border: "1px solid #D9D9D9",
                                padding: "3px",
                                textAlign: "center",
                              }}
                            >
                              {index + 1}
                            </td>
                            <td
                              style={{
                                border: "1px solid #D9D9D9",
                                textAlign: "left",
                                padding: "3px",
                                maxWidth: "200px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={file[1]}
                            >
                              {file[1]}
                            </td>
                            <td
                              style={{
                                border: "1px solid #D9D9D9",
                                padding: "3px",
                                textAlign: "center",
                              }}
                            >
                              {file[3]
                                ? new Date(file[3]).toLocaleString(
                                    "id-ID",
                                    {
                                      month: "long",
                                      year: "numeric",
                                    }
                                  )
                                : "-"}
                            </td>
                            <td
                              style={{
                                border: "1px solid #D9D9D9",
                                padding: "3px",
                                textAlign: "center",
                              }}
                            >
                              <span
                                onClick={() => handleDelete(file[1])}
                                style={{ cursor: "pointer", color: "#06344E" }}
                              >
                                <DeleteIcon />
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </Box>
              </Card>
            </Grid>

            {/* Upload File */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Tambah File Knowledge
              </Typography>

              <Card>
                <CardContent>
                  <form onSubmit={handleUpload}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                          accept=".pdf,.xlsx,.xls,.csv"
                          multiple
                          disabled={loading}
                        />
                        <Button
                          variant="outlined"
                          onClick={handleUploadButtonClick}
                          disabled={uploadLoading}
                          fullWidth
                        >
                          Pilih File
                        </Button>

                        {files.length > 0 && (
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor: "rgba(0, 0, 0, 0.03)",
                              mt: 2,
                            }}
                          >
                            {files.map((f, idx) => (
                              <Typography variant="body2" key={idx}>
                                File: <strong>{f.name}</strong> (
                                {(f.size / 1024).toFixed(1)} KB)
                              </Typography>
                            ))}
                          </Paper>
                        )}
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={
                            uploadLoading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <AddIcon />
                            )
                          }
                          disabled={files.length === 0 || uploadLoading}
                          fullWidth
                          sx={{backgroundColor: '#06344E', '&:hover': {backgroundColor: '#347AB6',}}}
                        >
                          {uploadLoading ? "Mengunggah..." : "Upload File"}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </LayoutAdmin>
      <style jsx global>{`
        * {
          font-family: 'Inter', sans-serif !important;
        }
      `}</style>
    </>
  );
}
